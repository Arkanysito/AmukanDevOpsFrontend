import axios from 'axios';
import { API_BASE_URL } from "../config";

const api = axios.create({
  baseURL: `${API_BASE_URL}`,
});

// Interceptor para agregar el access token a cada request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para renovar el token si expira
api.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config;
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const res = await api.post('/user/token/refresh/', { refresh: refreshToken });
        localStorage.setItem('access_token', res.data.access);
        originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
        return api(originalRequest); // Reintenta la request original
      } catch (refreshError) {
        console.error("Error al refrescar token", err);
      }
    }
    return Promise.reject(err);
  }
);

export default api;