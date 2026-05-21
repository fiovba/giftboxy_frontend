import api from "./api";

export const getBuyerProfile = () =>
  api.get("/buyer-profiles/me");

export const updateBuyerProfile = (data) =>
  api.put("/buyer-profiles/me", data);

export const buyerProfileService = {
  getBuyerProfile,
  updateBuyerProfile,
};
