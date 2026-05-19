// src/services/sellerProfileService.js
// PUT /seller-profiles/me: { storeName, shopUrl, bio, location, categories[] }
// POST /seller-profiles/me/avatar: multipart/form-data, field: "file"

import api from "./api";

export const getAllSellerProfiles = () =>
  api.get("/seller-profiles");

export const getSellerProfileById = (id) =>
  api.get(`/seller-profiles/${id}`);

export const getMySellerProfile = () =>
  api.get("/seller-profiles/me");

export const updateMySellerProfile = (data) =>
  api.put("/seller-profiles/me", {
    storeName: data.storeName,
    shopUrl: data.shopUrl || data.shopUrl || "",
    bio: data.bio || "",
    location: data.location || "",
    categories: Array.isArray(data.categories)
      ? data.categories
      : data.categories
      ? [data.categories]
      : [],
  });

export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post("/seller-profiles/me/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
export const sellerProfileService = {
  getAllSellerProfiles,
  getSellerProfileById,
  getMySellerProfile,
  updateMySellerProfile,
  uploadAvatar,
};
