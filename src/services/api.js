import axios from "axios";

const api = axios.create({
  baseURL: "https://giftboxy-backend-1.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/")
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          const res = await axios.post(
            "https://giftboxy-backend-1.onrender.com/api/auth/refresh-token",
            { refreshToken }
          );

          const newToken = res.data?.token || res.data?.accessToken;

          if (newToken) {
            localStorage.setItem("token", newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("role");
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
