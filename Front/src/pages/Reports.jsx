// src/pages/Reports.jsx
import React from "react";

const reports = [
  {
    name: "SUI - Información Comercial Mensual",
    entity: "SUI",
    freq: "Mensual",
    owner: "Coordinación Comercial",
    due: "10/12/2025",
    status: "En proceso",
    statusTone: "warning",
    risk: "Alta",
  },
  {
    name: "Superservicios - Indicadores de Calidad",
    entity: "Superservicios",
    freq: "Mensual",
    owner: "Calidad del Servicio",
    due: "12/12/2025",
    status: "Pendiente",
    statusTone: "danger",
    risk: "Crítica",
  },
  {
    name: "ANH - Balance de gas natural",
    entity: "ANH",
    freq: "Trimestral",
    owner: "Planeación",
    due: "18/12/2025",
    status: "En elaboración",
    statusTone: "info",
    risk: "Media",
  },
];

export default function Reports() {
  return (
    <div className="space-y-6">
      {/* Resumen ejecutivo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          label="Reportes activos"
          value="27"
          helper="Portafolio total configurado."
        />
        <MetricCard
          label="Pendientes"
          value="8"
          tone="warning"
          helper="Por cerrar en el mes en curso."
        />
        <MetricCard
          label="Vencidos"
          value="3"
          tone="danger"
          helper="2 críticos · 1 moderado."
        />
        <MetricCard
          label="% a tiempo (YTD)"
          value="92%"
          tone="success"
          helper="Meta corporativa: 90%."
        />
      </div>

      {/* Filtros + vista */}
      <div className="bg-white rounded-2xl border border-slate-200 px-4 py-4 md:px-5 md:py-4 flex flex-col gap-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-3 text-xs">
            <Select label="Entidad" value="Todas" />
            <Select label="Estado" value="Todos" />
            <Select label="Frecuencia" value="Todas" />
            <Select label="Periodo" value="Dic 2025" />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nombre, entidad o responsable..."
                className="h-9 w-72 rounded-full border border-slate-200 bg-slate-50 px-8 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
              <span className="pointer-events-none absolute left-2 top-1.5 text-slate-400 text-sm">
                🔍
              </span>
            </div>
            <button className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 h-9 text-xs font-medium text-white hover:bg-slate-800">
              + Nuevo reporte
            </button>
          </div>
        </div>

        {/* Tabs de vista (solo UI por ahora) */}
        <div className="flex items-center justify-between text-[11px]">
          <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
            <TabButton active>Activos</TabButton>
            <TabButton>Plantillas</TabButton>
            <TabButton>Histórico enviados</TabButton>
          </div>
          <span className="text-slate-500 hidden md:inline">
            Vista de trabajo del portafolio regulatorio.
          </span>
        </div>
      </div>

      {/* Tabla de reportes */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Portafolio de reportes regulatorios
            </h3>
            <p className="text-[11px] text-slate-500">
              Gestión centralizada de vencimientos, responsables y criticidad
              por entidad.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 text-[11px] text-slate-500">
            <span className="hidden sm:inline">27 registros encontrados</span>
            <LegendPills />
          </div>
        </div>

        <table className="w-full text-xs text-left">
          <thead className="border-b border-slate-200 bg-slate-50/60 text-slate-500">
            <tr>
              <th className="py-2 pl-4 font-medium">Reporte</th>
              <th className="py-2 font-medium">Entidad</th>
              <th className="py-2 font-medium">Frecuencia</th>
              <th className="py-2 font-medium">Responsable</th>
              <th className="py-2 font-medium">Próximo vencimiento</th>
              <th className="py-2 font-medium">Criticidad</th>
              <th className="py-2 text-center font-medium">Estado</th>
              <th className="py-2 pr-4 text-center font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reports.map((r) => (
              <ReportRow key={r.name} {...r} />
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-[11px] text-slate-500">
          <span>Mostrando 1–10 de 27 registros</span>
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

/* Components */

function MetricCard({ label, value, helper, tone = "neutral" }) {
  const tones = {
    neutral:
      "border-slate-200 bg-white text-slate-900 shadow-[0_10px_30px_rgba(15,23,42,0.04)]",
    success:
      "border-emerald-100 bg-emerald-50 text-emerald-900 shadow-[0_10px_30px_rgba(16,185,129,0.12)]",
    warning:
      "border-amber-100 bg-amber-50 text-amber-900 shadow-[0_10px_30px_rgba(245,158,11,0.12)]",
    danger:
      "border-red-100 bg-red-50 text-red-900 shadow-[0_10px_30px_rgba(239,68,68,0.12)]",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 text-xs ${tones[tone]}`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-soft-light bg-[radial-gradient(circle_at_0_0,#ffffff,transparent_55%),radial-gradient(circle_at_100%_0,#e5e7eb,transparent_55%)]" />
      <div className="relative space-y-1">
        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-600 mb-1">
          {label}
        </p>
        <p className="text-xl font-semibold text-slate-900 mb-0.5">{value}</p>
        {helper && (
          <p className="text-[11px] text-slate-600 leading-snug">{helper}</p>
        )}
      </div>
    </div>
  );
}

function Select({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
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

function TabButton({ children, active }) {
  return (
    <button
      type="button"
      className={[
        "px-3 py-1.5 text-[11px] rounded-full",
        active
          ? "bg-white text-slate-900 shadow-sm"
          : "text-slate-500 hover:bg-white/70",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function LegendPills() {
  return (
    <div className="flex items-center gap-2">
      <LegendDot className="bg-emerald-500" label="A tiempo" />
      <LegendDot className="bg-amber-500" label="Pendiente" />
      <LegendDot className="bg-red-500" label="Vencido" />
    </div>
  );
}

function LegendDot({ className, label }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`h-2 w-2 rounded-full ${className}`} />
      <span>{label}</span>
    </span>
  );
}

function EntityPill({ entity }) {
  const map = {
    SUI: "bg-sky-50 text-sky-800 border-sky-100",
    Superservicios: "bg-amber-50 text-amber-800 border-amber-100",
    ANH: "bg-emerald-50 text-emerald-800 border-emerald-100",
  };

  const cls =
    map[entity] || "bg-slate-50 text-slate-700 border-slate-100";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${cls}`}
    >
      {entity}
    </span>
  );
}

function RiskPill({ risk }) {
  const map = {
    Crítica: "bg-red-100 text-red-800",
    Alta: "bg-amber-100 text-amber-800",
    Media: "bg-sky-100 text-sky-800",
    Baja: "bg-emerald-100 text-emerald-800",
  };

  const cls = map[risk] || "bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium ${cls}`}
    >
      {risk}
    </span>
  );
}

function ReportRow({
  name,
  entity,
  freq,
  owner,
  due,
  status,
  statusTone,
  risk,
}) {
  const statusColors = {
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-sky-100 text-sky-800",
    success: "bg-emerald-100 text-emerald-800",
  };

  return (
    <tr className="text-slate-700 hover:bg-slate-50/80 transition">
      <td className="py-2.5 pl-4 pr-2 align-top">
        <p className="font-medium text-[11px] text-slate-900">{name}</p>
      </td>
      <td className="py-2.5 pr-2 align-top text-[11px]">
        <EntityPill entity={entity} />
      </td>
      <td className="py-2.5 pr-2 align-top text-[11px] text-slate-600">
        {freq}
      </td>
      <td className="py-2.5 pr-2 align-top text-[11px] text-slate-600">
        {owner}
      </td>
      <td className="py-2.5 pr-2 align-top text-[11px] text-slate-600">
        {due}
      </td>
      <td className="py-2.5 pr-2 align-top text-center">
        <RiskPill risk={risk} />
      </td>
      <td className="py-2.5 pr-2 align-top text-center">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium ${
            statusColors[statusTone] || statusColors.info
          }`}
        >
          {status}
        </span>
      </td>
      <td className="py-2.5 pr-4 align-top text-center">
        <div className="inline-flex gap-1">
          <button className="px-2 py-1 rounded-lg border border-slate-200 text-[10px] hover:bg-slate-50">
            Detalle
          </button>
          <button className="px-2 py-1 rounded-lg border border-slate-200 text-[10px] hover:bg-slate-50">
            Historial
          </button>
        </div>
      </td>
    </tr>
  );
}
