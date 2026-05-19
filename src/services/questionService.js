// src/services/questionService.js
// POST /questions expects: { questionText, productId }
// PATCH /questions/{id}/answer expects: { answerText }
// PATCH /questions/{id}/update-answer expects: { answerText }

import api from "./api";

export const getProductQuestions = (productId) =>
  api.get(`/questions/product/${productId}`);

export const createQuestion = (data) =>
  api.post("/questions", {
    questionText: data.questionText || data.question || data.text,
    productId: data.productId,
  });

export const deleteQuestion = (id) =>
  api.delete(`/questions/${id}`);

export const getMyQuestions = (unanswered = false) =>
  api.get("/questions/my-questions", {
    params: unanswered ? { unanswered: true } : {},
  });

export const answerQuestion = (id, data) =>
  api.patch(`/questions/${id}/answer`, {
    answerText: data.answerText || data.answer || data.text,
  });

export const updateQuestionAnswer = (id, data) =>
  api.patch(`/questions/${id}/update-answer`, {
    answerText: data.answerText || data.answer || data.text,
  });

export const questionService = {
  getProductQuestions,
  createQuestion,
  deleteQuestion,
  getMyQuestions,
  answerQuestion,
  updateQuestionAnswer,
};
