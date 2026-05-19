// src/services/categoryService.js

import api from "./api";

export const getCategories = async () => {
  const res = await api.get("/categories");
  const data = res.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.categories)) return data.categories;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export const getCategoryBySlug = (slug) =>
  api.get(`/categories/${slug}`);

export const categoryService = {
  getCategories,
  getCategoryBySlug,
};
