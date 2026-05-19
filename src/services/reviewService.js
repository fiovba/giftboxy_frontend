// src/services/reviewService.js
// Swagger schema from images - review fields to verify

import api from "./api";

export const getProductReviews = (productId) =>
  api.get(`/reviews/product/${productId}`);

export const createReview = (data) =>
  api.post("/reviews", {
    productId: data.productId,
    rating: data.rating,
    comment: data.comment || data.text,
  });

export const updateReview = (id, data) =>
  api.put(`/reviews/${id}`, {
    rating: data.rating,
    comment: data.comment || data.text,
  });

export const deleteReview = (id) =>
  api.delete(`/reviews/${id}`);

export const reviewService = {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
};
