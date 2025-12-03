// src/pages/MyTasks.jsx
import React, { useMemo } from "react";
import { getPendingReportsByUser } from "../utils/reportsCatalog";
import { getAllUsersFromStorage } from "../utils/usersCatalog";

// TODO: sustituir esto cuando tengas autenticación real
const CURRENT_USER_ID_KEY = "currentUserId";

function getCurrentUser() {
  if (typeof window === "undefined") return null;

  try {
    const id = window.localStorage.getItem(CURRENT_USER_ID_KEY);
    if (!id) return null;

    const users = getAllUsersFromStorage();
    return users.find((u) => String(u.id) === String(id)) || null;
  } catch {
    return null;
  }
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function MyTasks() {
  const currentUser = getCurrentUser();

  const pendingReports = useMemo(() => {
    if (!currentUser) return [];
    return getPendingReportsByUser(currentUser.id).sort((a, b) =>
      (a.fechaVencimiento || "").localeCompare(b.fechaVencimiento || "")
    );
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="rounded-2xl bg-white border border-slate-200 p-6 text-xs">
        <p className="text-sm font-semibold text-slate-900 mb-1">
          Mis Tareas Pendientes
        </p>
        <p className="text-[11px] text-slate-500">
          No hay usuario activo en sesión. Define <code>currentUserId</code> en
          localStorage o integra el módulo de autenticación.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white border border-slate-200 p-4 text-xs">
        <p className="text-sm font-semibold text-slate-900 mb-1">
          Mis Tareas Pendientes
        </p>
        <p className="text-[11px] text-slate-500">
          Obligaciones de reporte asignadas a{" "}
          <span className="font-medium text-slate-900">
            {currentUser.fullName}
          </span>{" "}
          (ID usuario: {currentUser.userId}).
        </p>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="border-b border-slate-200 bg-slate-50/60 text-slate-500">
            <tr>
              <th className="py-2 pl-4 font-medium">Reporte / obligación</th>
              <th className="py-2 font-medium">Fecha de vencimiento</th>
              <th className="py-2 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pendingReports.map((r) => (
              <tr
                key={r.id}
                className="hover:bg-slate-50/70 text-slate-700"
              >
                <td className="py-2.5 pl-4 pr-2 text-[11px] font-medium">
                  {r.titulo}
                </td>
                <td className="py-2.5 pr-2 text-[11px]">
                  {formatDate(r.fechaVencimiento)}
                </td>
                <td className="py-2.5 pr-4 text-[11px]">
                  <StatusPill estado={r.estado} />
                </td>
              </tr>
            ))}

            {pendingReports.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="py-6 text-center text-[11px] text-slate-500"
                >
                  No tienes tareas pendientes asignadas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusPill({ estado }) {
  const map = {
    Pendiente: "bg-amber-100 text-amber-800",
    Vencido: "bg-red-100 text-red-800",
    Enviado: "bg-emerald-100 text-emerald-800",
  };
  const cls = map[estado] || "bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium ${cls}`}
    >
      {estado}
    </span>
  );
}
