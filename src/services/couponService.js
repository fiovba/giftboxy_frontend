// src/services/couponService.js

import api from "./api";

export const createCoupon = (data) =>
  api.post("/coupons", data);

export const getMyCoupons = () =>
  api.get("/coupons/my-coupons");

export const toggleCoupon = (id) =>
  api.patch(`/coupons/${id}/toggle`);

export const deleteCoupon = (id) =>
  api.delete(`/coupons/${id}`);

export const applyCoupon = (data) =>
  api.post("/coupons/apply", data);

export const couponService = {
  createCoupon,
  getMyCoupons,
  toggleCoupon,
  deleteCoupon,
  applyCoupon,
};