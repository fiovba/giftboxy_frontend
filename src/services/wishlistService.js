// src/services/wishlistService.js

import api from "./api";

export const getWishlist = () =>
  api.get("/wishlist");

export const addToWishlist = (productId) =>
  api.post(`/wishlist/${productId}`);

export const deleteWishlistItem = (wishlistItemId) =>
  api.delete(`/wishlist/${wishlistItemId}`);

export const wishlistService = {
  getWishlist,
  addToWishlist,
  deleteWishlistItem,
};