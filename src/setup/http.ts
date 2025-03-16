import axios from "axios";

export const API_URL = "http://127.0.0.1:8000/api/v1";

const apiInstance = axios.create({
  withCredentials: true,
  baseURL: API_URL,
});

apiInstance.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
  return config;
});

export default apiInstance;
