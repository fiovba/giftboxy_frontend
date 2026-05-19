// src/services/authService.js

import api from "./api";

export const buyerRegister = (data) =>
  api.post("/auth/buyer-register", data);

export const sellerRegister = (data) =>
  api.post("/auth/seller-register", data);

export const buyerLogin = (data) =>
  api.post("/auth/buyer-login", data);

export const sellerLogin = (data) =>
  api.post("/auth/seller-login", data);

export const refreshToken = (data) =>
  api.post("/auth/refresh-token", data);

export const changePassword = (data) =>
  api.post("/auth/change-password", data);

export const logout = () =>
  api.post("/auth/logout");

export const getMe = () =>
  api.get("/auth/me");

export const authService = {
  buyerRegister,
  sellerRegister,
  buyerLogin,
  sellerLogin,
  refreshToken,
  changePassword,
  logout,
  getMe,
};