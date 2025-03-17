import axios from "axios";

export const API_URL = "http://127.0.0.1:8000/api/v1";

const $api = axios.create({
  withCredentials: true,
  baseURL: API_URL,
});

$api.interceptors.request.use((config) => {
  if (!config.headers) {
    config.headers = new axios.AxiosHeaders();
  }
  
  const token = localStorage.getItem("access");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

$api.interceptors.response.use(
  (config) => {
    return config;
  },
  async (error) => {
    const originalRequest = error.config;
    const statusCode = error.response?.status;
    if (statusCode == 401 && error.config && !error.config._isRetry == true) {
      originalRequest._isRetry = true;
      try {
        const refresh = localStorage.getItem("refresh");

        if (!refresh) {
          throw new Error("Нет refresh-токена");
        }

        const response = await $api.post(
          `/accounts/token/refresh/`,
          {
            refresh: refresh,
          },
          { withCredentials: true }
        );

        localStorage.setItem("access", response.data.access);
        localStorage.removeItem("refresh");

        return $api.request(originalRequest);
      } catch {
        window.location.href = "/auth";
      }
    }
    throw error;
  }
);

export default $api;
