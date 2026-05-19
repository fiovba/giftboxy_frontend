// src/services/cartService.js

import api from "./api";

export const getCart = () =>
  api.get("/cart");

export const addToCart = (data) =>
  api.post("/cart", data);

export const updateCartItem = (cartItemId, data) =>
  api.put(`/cart/${cartItemId}`, data);

export const deleteCartItem = (cartItemId) =>
  api.delete(`/cart/${cartItemId}`);

export const clearCart = () =>
  api.delete("/cart");

export const cartService = {
  getCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
  clearCart,
};