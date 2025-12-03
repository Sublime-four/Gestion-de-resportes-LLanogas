// src/utils/reportsCatalog.js

// Usamos la misma key que en MainLayout: "reportesCreados"
const REPORTS_STORAGE_KEY = "reportesCreados";

export function getAllReportsFromStorage() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(REPORTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Reportes pendientes de un usuario (por id interno del usuario)
 * - Pendiente
 * - Vencido
 */
export function getPendingReportsByUser(userId) {
  return getAllReportsFromStorage().filter((r) => {
    const sameUser = String(r.responsableUserId) === String(userId);
    const isPending = r.estado === "Pendiente" || r.estado === "Vencido";
    return sameUser && isPending;
  });
}
