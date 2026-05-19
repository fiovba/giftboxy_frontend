import api from "./api";

export const createOrder = (data) =>
  api.post("/orders", {
    shippingAddress: data.shippingAddress,
    paymentMethod: Number(data.paymentMethod) || 1,
    ...(data.couponCode ? { couponCode: data.couponCode } : {}),
  });

export const getMyOrders = () =>
  api.get("/orders/my-orders");

export const getOrderById = (id) =>
  api.get(`/orders/${id}`);

export const cancelOrder = (id) =>
  api.patch(`/orders/${id}/cancel`);

export const getSellerOrders = () =>
  api.get("/orders/seller-orders");

export const updateOrderStatus = (id, status) =>
  api.patch(`/orders/${id}/status`, { status });

export const orderService = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getSellerOrders,
  updateOrderStatus,
};