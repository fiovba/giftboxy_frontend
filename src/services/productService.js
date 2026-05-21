import api from "./api";

export const getProducts = (params) =>
  api.get("/products", { params });

export const getProductBySlug = (slug) =>
  api.get(`/products/${slug}`);

export const giftFinder = (data) =>
  api.post("/products/gift-finder", {
    recipient: data.recipient,
    occasion: data.occasion,
    interest: data.interest,
    minBudget: Number(data.minBudget ?? 0),
    maxBudget: Number(data.maxBudget ?? 99999),
  });

const buildFormData = (data) => {
  const formData = new FormData();

  if (data.title) formData.append("Title", data.title);
  if (data.description) formData.append("Description", data.description);
  if (data.price !== undefined) formData.append("Price", data.price);
  if (data.oldPrice !== undefined) formData.append("OldPrice", data.oldPrice);
  if (data.stock !== undefined) formData.append("StockCount", data.stock);
  if (data.stockCount !== undefined) formData.append("StockCount", data.stockCount);
  if (data.isPersonalized !== undefined) formData.append("IsPersonalized", data.isPersonalized);
  if (data.budgetRange) formData.append("BudgetRange", data.budgetRange);
  if (data.categoryId) formData.append("CategoryId", data.categoryId);

  const parseTags = (tags) =>
    Array.isArray(tags)
      ? tags.flatMap((t) => t.split(",").map((x) => x.trim())).filter(Boolean)
      : typeof tags === "string"
      ? tags.split(",").map((x) => x.trim()).filter(Boolean)
      : [];

  parseTags(data.recipientTags).forEach((tag) =>
    formData.append("RecipientTags", tag)
  );

  parseTags(data.occasionTags).forEach((tag) =>
    formData.append("OccasionTags", tag)
  );

  parseTags(data.interestTags).forEach((tag) =>
    formData.append("InterestTags", tag)
  );

  if (data.imageUrl) formData.append("Images", data.imageUrl);
  // For edit mode: send remaining existing image URLs so backend can drop removed ones
  if (Array.isArray(data.remainingImageUrls)) {
    data.remainingImageUrls.forEach((url) => formData.append("ExistingImageUrls", url));
  }

  return formData;
};

export const createProduct = (data) =>
  api.post("/products", buildFormData(data), {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateProduct = (id, data) =>
  api.put(`/products/${id}`, buildFormData(data), {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteProduct = (id) =>
  api.delete(`/products/${id}`);

export const getMyProducts = () =>
  api.get("/products/my-products");

export const productService = {
  getProducts,
  getProductBySlug,
  giftFinder,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
};