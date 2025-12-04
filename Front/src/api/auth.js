// src/api/auth.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para meter el JWT en TODAS las peticiones
api.interceptors.request.use((config) => {
  const raw = localStorage.getItem("llanogas_auth") || sessionStorage.getItem("llanogas_auth");
  if (raw) {
    try {
      const { token } = JSON.parse(raw);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // ignore
    }
  }
  return config;
});

export async function loginApi(email, password) {
  const resp = await api.post("/api/auth/login", { email, password });
  // Backend debe devolver: { token: "...", user: { ... } }
  return resp.data;
}
