// src/pages/Users.jsx
import React from "react";

const users = [
  {
    name: "Yohan Piñarte",
    email: "yohan@llanogas.com",
    role: "Administrador",
    area: "Ingeniería y Desarrollo",
    status: "Activo",
    lastAccess: "02/12/2025 09:34",
  },
  {
    name: "Coordinación Comercial",
    email: "coord.comercial@llanogas.com",
    role: "Gestor de reportes",
    area: "Comercial",
    status: "Activo",
    lastAccess: "01/12/2025 17:15",
  },
  {
    name: "Invitado Auditoría",
    email: "auditoria@externo.com",
    role: "Consulta",
    area: "Auditoría externa",
    status: "Pendiente",
    lastAccess: "—",
  },
];

export default function Users() {
  return (
    <div className="space-y-6">
      {/* Resumen ejecutivo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          label="Usuarios registrados"
          value="12"
          helper="Incluye internos y externos."
        />
        <MetricCard
          label="Activos"
          value="9"
          tone="success"
          helper="Con acceso vigente al sistema."
        />
        <MetricCard
          label="Pendientes de activación"
          value="3"
          tone="warning"
          helper="Invitaciones sin completar."
        />
        <MetricCard
          label="Perfiles administradores"
          value="2"
          tone="neutral"
          helper="Responsables de configuración."
        />
      </div>

      {/* Filtros + acciones */}
      <div className="bg-white rounded-2xl border border-slate-200 px-4 py-4 md:px-5 md:py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-3 text-xs">
          <FilterSelect label="Rol" value="Todos" />
          <FilterSelect label="Estado" value="Todos" />
          <FilterSelect label="Área" value="Todas" />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              className="h-9 w-64 rounded-full border border-slate-200 bg-slate-50 px-8 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
            <span className="pointer-events-none absolute left-2 top-1.5 text-slate-400 text-sm">
              🔍
            </span>
          </div>
          <button className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 h-9 text-xs font-medium text-white hover:bg-slate-800">
            + Nuevo usuario
          </button>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Usuarios y roles
            </h2>
            <p className="text-[11px] text-slate-500">
              Administración de accesos al módulo de reportes regulatorios.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3 text-[11px] text-slate-500">
            <LegendStatus color="bg-emerald-500" label="Activo" />
            <LegendStatus color="bg-amber-500" label="Pendiente" />
            <LegendStatus color="bg-slate-400" label="Suspendido" />
          </div>
        </div>

        <table className="w-full text-xs text-left">
          <thead className="border-b border-slate-200 bg-slate-50/60 text-slate-500">
            <tr>
              <th className="py-2 pl-4 font-medium">Usuario</th>
              <th className="py-2 font-medium">Correo</th>
              <th className="py-2 font-medium">Rol</th>
              <th className="py-2 font-medium">Área</th>
              <th className="py-2 font-medium">Último acceso</th>
              <th className="py-2 pr-4 text-center font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <UserRow key={u.email} {...u} />
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-[11px] text-slate-500">
          <span>Mostrando 1–{users.length} de 12 usuarios</span>
          <div className="flex items-center gap-1">
            <button className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50">
              ‹
            </button>
            <span className="px-2">1</span>
            <button className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50">
              2
            </button>
            <button className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50">
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Components auxiliares */

function MetricCard({ label, value, helper, tone = "neutral" }) {
  const tones = {
    neutral: "border-slate-200 bg-white text-slate-900",
    success: "border-emerald-100 bg-emerald-50 text-emerald-900",
    warning: "border-amber-100 bg-amber-50 text-amber-900",
    danger: "border-red-100 bg-red-50 text-red-900",
  };

  return (
    <div
      className={`relative rounded-2xl border p-4 text-xs shadow-sm ${tones[tone]}`}
    >
      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 mb-1">
        {label}
      </p>
      <p className="text-xl font-semibold text-slate-900 mb-0.5">{value}</p>
      {helper && <p className="text-[11px] text-slate-500">{helper}</p>}
    </div>
  );
}

function FilterSelect({ label, value }) {
  return (
    <div className="flex flex-col gap-1 text-[11px]">
      <span className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
        {label}
      </span>
      <button className="inline-flex items-center justify-between gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-700 hover:bg-slate-50">
        <span>{value}</span>
        <span className="text-xs text-slate-400">▾</span>
      </button>
    </div>
  );
}

function LegendStatus({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span>{label}</span>
    </span>
  );
}

function RolePill({ role }) {
  const map = {
    Administrador: "bg-slate-900 text-slate-50",
    "Gestor de reportes": "bg-sky-100 text-sky-800",
    Consulta: "bg-slate-100 text-slate-700",
  };

  const cls = map[role] || "bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium ${cls}`}
    >
      {role}
    </span>
  );
}

function UserRow({ name, email, role, area, status, lastAccess }) {
  const statusClass =
    status === "Activo"
      ? "bg-emerald-100 text-emerald-800"
      : status === "Pendiente"
      ? "bg-amber-100 text-amber-800"
      : "bg-slate-200 text-slate-700";

  return (
    <tr className="text-slate-700 hover:bg-slate-50/80 transition">
      <td className="py-2.5 pl-4 pr-2 text-[11px]">
        <p className="font-semibold text-slate-900">{name}</p>
      </td>
      <td className="py-2.5 pr-2 text-[11px] text-slate-500">{email}</td>
      <td className="py-2.5 pr-2 text-[11px]">
        <RolePill role={role} />
      </td>
      <td className="py-2.5 pr-2 text-[11px] text-slate-600">{area}</td>
      <td className="py-2.5 pr-2 text-[11px] text-slate-500">
        {lastAccess}
      </td>
      <td className="py-2.5 pr-4 text-center">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium ${statusClass}`}
        >
          {status}
        </span>
      </td>
    </tr>
  );
}
