// src/services/notificationsApi.js
// Punto base del backend
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// Helper genérico
async function apiRequest(path, options = {}) {
  const resp = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
     
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(
      `Error ${resp.status} en ${path}: ${text || resp.statusText}`
    );
  }

  if (resp.status === 204) return null;
  return resp.json();
}

/**
 * GET /api/notifications
 * Lista las notificaciones para el usuario actual
 */
export async function fetchNotifications() {
  return apiRequest("/api/notifications", { method: "GET" });
}

/**
 * PATCH /api/notifications/{id}/read
 * Marca una notificación como leída
 */
export async function markNotificationReadApi(id) {
  if (!id) return;
  return apiRequest(`/api/notifications/${id}/read`, { method: "PATCH" });
}

/**
 * PATCH /api/notifications/read-all
 * Marca TODAS como leídas
 */
export async function markAllNotificationsReadApi() {
  return apiRequest("/api/notifications/read-all", { method: "PATCH" });
}
