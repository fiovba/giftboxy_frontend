import api from "./api";
import { createProduct, updateProduct } from "./productService";

export const sellerService = {
  getAllProducts: async () => {
    const res = await api.get("/products");
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.products)) return data.products;
    return [];
  },

  getSellerProducts: async () => {
    const res = await api.get("/products/my-products");
    const data = res.data;
    console.log("MY PRODUCTS RAW:", data);
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.products)) return data.products;
    return [];
  },

 getProductById: async (productId) => {
 
  const res = await api.get("/products/my-products");
  const data = res.data;
  const list = Array.isArray(data) ? data
    : Array.isArray(data?.items) ? data.items
    : Array.isArray(data?.data) ? data.data : [];
  return list.find((p) => String(p.id) === String(productId)) || null;
},

  addProduct: async (product) => {
    const res = await createProduct(product);
    return res.data;
  },

  updateProduct: async (productId, updatedProduct) => {
    const res = await updateProduct(productId, updatedProduct);
    return res.data;
  },

  deleteProduct: async (productId) => {
    const res = await api.delete(`/products/${productId}`);
    return res.data;
  },
};