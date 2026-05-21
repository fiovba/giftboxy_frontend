import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FiUpload, FiX, FiAlertCircle } from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";
import { sellerService } from "../../services/sellerService";
import { categoryService } from "../../services/categoryService";
import { imageService } from "../../services/imageService";

function AddProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const isEditMode = Boolean(id);
  const sellerId = user?.sellerProfileId || user?.id;

  const [apiCategories, setApiCategories] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  // existing images loaded from backend: [{id, url}]
  const [existingImages, setExistingImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    title: "",
    category: "",
    categoryId: "",
    price: "",
    oldPrice: "",
    stock: "",
    description: "",
    budgetRange: "$25 - $50",
    isPersonalized: false,
    recipientTags: "Mom, Partner, Friend",
    occasionTags: "Birthday, Anniversary",
    interestTags: "Personalized, Home",
    sellerId,
  });

  useEffect(() => {
    categoryService.getCategories().then((cats) => {
      setApiCategories(Array.isArray(cats) ? cats : []);
    }).catch(() => setApiCategories([]));
  }, []);

  useEffect(() => {
    if (!isEditMode) return;

    sellerService.getProductById(id).then((product) => {
      if (!product) {
        toast.error("Product not found.");
        navigate("/seller/products");
        return;
      }

      setForm({
        title: product.title || "",
        category: product.category?.slug || product.category || "",
        categoryId: product.categoryId || product.category?.id || "",
        price: product.price || "",
        oldPrice: product.oldPrice || "",
        stock: product.stockCount || product.stock || "",
        description: product.description || "",
        budgetRange: product.budgetRange || "$25 - $50",
        isPersonalized: product.isPersonalized || false,
        recipientTags: Array.isArray(product.recipientTags)
          ? product.recipientTags.join(", ")
          : product.recipientTags || "",
        occasionTags: Array.isArray(product.occasionTags)
          ? product.occasionTags.join(", ")
          : product.occasionTags || "",
        interestTags: Array.isArray(product.interestTags)
          ? product.interestTags.join(", ")
          : product.interestTags || "",
        sellerId: product.sellerId || sellerId,
      });

      if (product.images?.length > 0) {
        const BASE = "https://giftboxy-backend-1.onrender.com";
        const normalized = product.images.map((img) => {
          if (typeof img === "string") {
            const url = img.startsWith("http") ? img : `${BASE}${img}`;
            // Extract numeric DB id from URL query/path, or Cloudinary filename as fallback
            const cloudinaryId = url.split("/").pop()?.split("?")[0]?.split(".")[0] || null;
            return { id: cloudinaryId, url };
          }
          const url = (img.url || img.imageUrl || "").startsWith("http")
            ? (img.url || img.imageUrl)
            : `${BASE}${img.url || img.imageUrl || ""}`;
          const fallbackId = url.split("/").pop()?.split("?")[0]?.split(".")[0] || null;
          return { id: img.id ?? img.imageId ?? fallbackId, url };
        });
        setExistingImages(normalized);
        setImagePreviews(normalized.map((i) => i.url));
      }
    }).catch(() => {
      toast.error("Product not found.");
      navigate("/seller/products");
    });
  }, [id, isEditMode, navigate, sellerId]);

  const validate = (name, value) => {
    switch (name) {
      case "title":
        return value.trim().length < 3 ? "Title must be at least 3 characters." : "";
      case "price":
        return Number(value) <= 0 ? "Price must be greater than 0." : "";
      case "oldPrice":
        return value && Number(value) <= 0 ? "Old price must be greater than 0." : "";
      case "stock":
        return Number(value) < 0 ? "Stock cannot be negative." : "";
      case "description":
        return value.trim().length < 10 ? "Description must be at least 10 characters." : "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "category") {
      const selectedCat = apiCategories.find(
        (cat) => cat.slug === value || String(cat.id) === String(value)
      );
      setForm({ ...form, category: value, categoryId: selectedCat?.id || value });
      return;
    }

    const newValue = type === "checkbox" ? checked : value;
    setForm({ ...form, [name]: newValue });

    // Real-time validation
    const error = validate(name, String(newValue));
    setFieldErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const remaining = 5 - imagePreviews.length;
    if (remaining <= 0) {
      toast.error("Maximum 5 images allowed.");
      return;
    }
    const allowed = files.slice(0, remaining);
    const newFiles = [...imageFiles, ...allowed];
    setImageFiles(newFiles);
    const newPreviews = allowed.map(f => URL.createObjectURL(f));
    setImagePreviews(prev => [...prev, ...newPreviews].slice(0, 5));
  };

  const removeImage = (index) => {
    const preview = imagePreviews[index];
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    if (preview.startsWith("blob:")) {
      const blobPreviews = imagePreviews.filter((p) => p.startsWith("blob:"));
      const blobIndex = blobPreviews.indexOf(preview);
      setImageFiles((prev) => prev.filter((_, i) => i !== blobIndex));
    } else {
      // Existing backend image removed — track for deletion
      const existing = existingImages.find((img) => img.url === preview);
      const imgId = existing?.id
        ?? preview.split("/").pop()?.split("?")[0]?.split(".")[0]
        ?? null;
      if (imgId) {
        setRemovedImageIds((prev) => [...prev, imgId]);
      }
      setExistingImages((prev) => prev.filter((img) => img.url !== preview));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final validation
    const errors = {};
    ["title", "price", "stock", "description"].forEach((key) => {
      const err = validate(key, String(form[key]));
      if (err) errors[key] = err;
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Please fix the errors before submitting.");
      return;
    }

    if (imageFiles.length === 0 && imagePreviews.length === 0) {
      toast.error("Please add at least 1 image.");
      return;
    }

    try {
      let productId = id;

      if (isEditMode) {
        await sellerService.updateProduct(id, form);
        toast.success("Product updated successfully.");
      } else {
        const res = await sellerService.addProduct({ ...form, sellerId });
        productId = res?.id || res?.productId || res?.data?.id;
        toast.success("Product added successfully.");
      }

      // Delete removed existing images
      if (isEditMode && removedImageIds.length > 0) {
        await Promise.allSettled(removedImageIds.map((imgId) => imageService.deleteImage(imgId)));
      }

      // Upload new images
      if (imageFiles.length > 0 && productId) {
        setUploading(true);
        try {
          for (const file of imageFiles) {
            const formData = new FormData();
            formData.append("file", file);
            await imageService.uploadImage(productId, formData);
          }
        } catch {
          toast.error("Product saved but image upload failed.");
        } finally {
          setUploading(false);
        }
      }

      navigate("/seller/products");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error?.response?.data?.title ||
        "Operation failed."
      );
    }
  };

  const fallbackCategories = [
    { id: "personalized", slug: "personalized", name: "Personalized" },
    { id: "jewelry", slug: "jewelry", name: "Jewelry" },
    { id: "home-decor", slug: "home-decor", name: "Home Decor" },
    { id: "food", slug: "food", name: "Artisanal Food" },
    { id: "accessories", slug: "accessories", name: "Accessories" },
    { id: "beauty", slug: "beauty", name: "Beauty" },
  ];

  const displayCategories = apiCategories.length > 0 ? apiCategories : fallbackCategories;
  const canAddMore = imagePreviews.length < 5;

  return (
    <div>
      <p className="text-[#D90452] text-xs font-black uppercase tracking-widest">
        {isEditMode ? "Edit Listing" : "New Listing"}
      </p>
      <h1 className="mt-2 text-4xl font-black">
        {isEditMode ? "Edit Product" : "Add Product"}
      </h1>
      <p className="mt-2 text-[#7A7272]">
        {isEditMode
          ? "Update product information, price, image, stock and tags."
          : "Create a new handmade gift listing for your shop."}
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 bg-white rounded-[32px] p-8 border border-[#EFE4DF] grid lg:grid-cols-2 gap-6"
      >
        <ValidatedInput
          label="Product Title"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Handmade pearl bracelet"
          error={fieldErrors.title}
        />

        <div>
          <Label>Category</Label>
          <select name="category" value={form.category} onChange={handleChange} className="field">
            <option value="">Select category</option>
            {displayCategories.map((cat) => (
              <option key={cat.id} value={cat.slug || cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <ValidatedInput
          label="Price ($)"
          name="price"
          type="number"
          min="0.01"
          step="0.01"
          value={form.price}
          onChange={handleChange}
          placeholder="55"
          error={fieldErrors.price}
        />

        <ValidatedInput
          label="Old Price ($)"
          name="oldPrice"
          type="number"
          min="0"
          step="0.01"
          value={form.oldPrice}
          onChange={handleChange}
          placeholder="70 (optional)"
          error={fieldErrors.oldPrice}
          required={false}
        />

        <ValidatedInput
          label="Stock"
          name="stock"
          type="number"
          min="0"
          value={form.stock}
          onChange={handleChange}
          placeholder="10"
          error={fieldErrors.stock}
        />

        <div>
          <Label>Budget Range</Label>
          <select name="budgetRange" value={form.budgetRange} onChange={handleChange} className="field">
            <option>$0 - $25</option>
            <option>$25 - $50</option>
            <option>$50 - $100</option>
            <option>$100+</option>
          </select>
        </div>

        {/* Image Upload */}
        <div className="lg:col-span-2">
          <Label>
            Product Images{" "}
            <span className="text-[#7A7272] normal-case font-semibold">
              (min 1, max 5) — {imagePreviews.length}/5
            </span>
          </Label>

          <div className="mt-3 flex flex-wrap gap-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Image ${index + 1}`}
                  className="w-28 h-28 rounded-[16px] object-cover border border-[#EFE4DF]"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-[#D90452] text-white rounded-full flex items-center justify-center shadow"
                >
                  <FiX size={12} />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-1 left-1 bg-[#D90452] text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                    Main
                  </span>
                )}
              </div>
            ))}

            {canAddMore && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-28 h-28 rounded-[16px] border-2 border-dashed border-[#EFE4DF] flex flex-col items-center justify-center hover:border-[#D90452] hover:bg-[#F8E7EC] transition cursor-pointer"
              >
                <FiUpload className="text-[#D90452]" size={20} />
                <p className="text-xs font-bold text-[#7A7272] mt-1.5 text-center">Add Photo</p>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
          <p className="text-xs text-[#7A7272] mt-2">
            First image will be the main photo. JPG, PNG, WEBP — max 5MB each.
          </p>
        </div>

        <label className="flex items-center gap-3 font-bold">
          <input
            type="checkbox"
            name="isPersonalized"
            checked={form.isPersonalized}
            onChange={handleChange}
            className="accent-[#D90452]"
          />
          Personalized product
        </label>

        <ValidatedTextarea
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe your product..."
          error={fieldErrors.description}
        />

        <Textarea
          label="Recipient Tags"
          name="recipientTags"
          value={form.recipientTags}
          onChange={handleChange}
          placeholder="Mom, Partner, Friend"
        />

        <Textarea
          label="Occasion Tags"
          name="occasionTags"
          value={form.occasionTags}
          onChange={handleChange}
          placeholder="Birthday, Anniversary, Wedding"
        />

        <Textarea
          label="Interest Tags"
          name="interestTags"
          value={form.interestTags}
          onChange={handleChange}
          placeholder="Jewelry, Personalized, Luxury"
        />

        <button
          disabled={uploading}
          className="lg:col-span-2 bg-[#D90452] text-white py-4 rounded-full font-black disabled:opacity-60"
        >
          {uploading ? "Uploading images..." : isEditMode ? "Update Product" : "Add Product"}
        </button>
      </form>
    </div>
  );
}

function Label({ children }) {
  return (
    <label className="text-[11px] font-black uppercase tracking-widest text-[#6F6262]">
      {children}
    </label>
  );
}

function ErrorMsg({ error }) {
  if (!error) return null;
  return (
    <div className="flex items-center gap-1.5 mt-1.5">
      <FiAlertCircle size={12} className="text-red-500 flex-shrink-0" />
      <p className="text-xs text-red-500 font-bold">{error}</p>
    </div>
  );
}

function ValidatedInput({ label, error, required = true, ...props }) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        {...props}
        required={required}
        className={`field mt-1 ${error ? "border-red-300 bg-red-50" : ""}`}
      />
      <ErrorMsg error={error} />
    </div>
  );
}

function ValidatedTextarea({ label, error, ...props }) {
  return (
    <div className="lg:col-span-2">
      <Label>{label}</Label>
      <textarea
        {...props}
        required
        className={`field h-[110px] resize-none mt-1 ${error ? "border-red-300 bg-red-50" : ""}`}
      />
      <ErrorMsg error={error} />
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div className="lg:col-span-2">
      <Label>{label}</Label>
      <textarea {...props} required className="field h-[110px] resize-none mt-1" />
    </div>
  );
}

export default AddProduct;