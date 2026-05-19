// src/services/imageService.js

import api from "./api";

export const uploadImage = (productId, formData) =>
  api.post(`/images/upload/${productId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const deleteImage = (imageId) =>
  api.delete(`/images/${imageId}`);

export const imageService = {
  uploadImage,
  deleteImage,
};