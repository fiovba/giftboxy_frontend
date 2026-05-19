export function normalizeProduct(product) {
  const image =
    product.imageUrl ||
    product.thumbnailUrl ||
    product.mainImageUrl ||
    product.image ||
    product.photo ||
    product.images?.[0]?.url ||
    product.images?.[0]?.imageUrl ||
    product.images?.[0] ||
    "";

  const stock =
    product.stock ??
    product.quantity ??
    product.stockCount ??
    product.availableStock ??
    product.count ??
    0;

  return {
    ...product,
    id: product.id,
    slug: product.slug,
    title: product.title || product.name || "Untitled Product",
    description: product.description || "",
    category: product.categoryName || product.categorySlug || product.category || "",
    price: Number(product.price || 0),
    oldPrice: Number(product.oldPrice || 0),
    rating: Number(product.rating || product.averageRating || 0),
    reviews: Number(product.reviews || product.reviewCount || 0),
    stock: Number(stock),
    isPersonalized: Boolean(product.isPersonalized),
    isBestSeller: Boolean(product.isBestSeller),
    isFeatured: Boolean(product.isFeatured),
    isNew: Boolean(product.isNew),
    badge:
      product.badge ||
      (product.isBestSeller ? "Best Seller" : product.isNew ? "New" : ""),
    images: image ? [image] : [],
  };
}

export function normalizeProductList(response) {
  const list =
    response?.data?.data ||
    response?.data?.items ||
    response?.data?.products ||
    response?.data ||
    response?.items ||
    response?.products ||
    response ||
    [];

  return Array.isArray(list) ? list.map(normalizeProduct) : [];
}