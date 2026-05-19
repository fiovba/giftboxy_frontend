// src/services/chatService.js

import api from "./api";

export const getConversations = () =>
  api.get("/chat/conversations");

export const getConversationMessages = (id) =>
  api.get(`/chat/conversations/${id}`);

export const createConversation = (data) =>
  api.post("/chat/conversations", data);

export const sendMessage = (data) =>
  api.post("/chat/messages", data);

export const getUnreadCount = () =>
  api.get("/chat/unread-count");

export const chatService = {
  getConversations,
  getConversationMessages,
  createConversation,
  sendMessage,
  getUnreadCount,
};