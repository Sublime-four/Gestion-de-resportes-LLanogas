// src/pages/Compliance.jsx
import React from "react";

const entities = [
  {
    entidad: "SUI",
    tiempo: 14,
    pendientes: 3,
    vencidos: 2,
    riesgo: "Alto",
    cumplimiento: "86%",
  },
  {
    entidad: "Superservicios",
    tiempo: 7,
    pendientes: 2,
    vencidos: 1,
    riesgo: "Medio",
    cumplimiento: "82%",
  },
  {
    entidad: "ANH",
    tiempo: 5,
    pendientes: 1,
    vencidos: 0,
    riesgo: "Bajo",
    cumplimiento: "100%",
  },
];

export default function Compliance() {
  return (
    <div className="space-y-6">
      {/* KPIs de cumplimiento */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard
          label="Cumplimiento a tiempo (YTD)"
          value="92%"
          helper="Meta corporativa 90% · Dentro del rango objetivo."
          tone="success"
        />
        <KpiCard
          label="Reportes vencidos"
          value="3"
          helper="2 críticos · 1 moderado en el mes actual."
          tone="danger"
        />
        <KpiCard
          label="Pendientes por cerrar"
          value="8"
          helper="Obligaciones en curso con vencimiento activo."
          tone="warning"
        />
        <KpiCard
          label="Índice de riesgo regulatorio"
          value="Medio"
          helper="Concentrado principalmente en SUI y Superservicios."
          tone="neutral"
        />
      </div>

      {/* Filtros y contexto */}
      <div className="bg-white rounded-2xl border border-slate-200 px-4 py-4 md:px-5 md:py-4 flex flex-col gap-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-3 text-xs">
            <Select label="Periodo" value="Dic 2025" />
            <Select label="Entidad" value="Todas" />
            <Select label="Nivel de riesgo" value="Todos" />
          </div>

          <p className="text-[11px] text-slate-500 max-w-md md:text-right">
            Vista consolidada del estado de cumplimiento por entidad reguladora.
            Permite priorizar acciones sobre vencidos y reportes en zona de
            riesgo.
          </p>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>
            3 entidades activas · 27 reportes en el portafolio de cumplimiento.
          </span>
          <Legend />
        </div>
      </div>

      {/* Cuerpo principal: tabla + riesgo consolidado */}
      <div className="grid lg:grid-cols-[1.5fr,1.1fr] gap-4">
        {/* Tabla por entidad */}
        <SectionCard
          title="Obligaciones por entidad"
          subtitle="Distribución de reportes enviados, pendientes y vencidos por regulador."
        >
          <div className="overflow-hidden border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="border-b border-slate-200 bg-slate-50/60 text-slate-500">
                <tr>
                  <th className="py-2 pl-4 font-medium">Entidad</th>
                  <th className="py-2 font-medium">A tiempo</th>
                  <th className="py-2 font-medium">Pendientes</th>
                  <th className="py-2 font-medium">Vencidos</th>
                  <th className="py-2 font-medium">% cumplimiento</th>
                  <th className="py-2 pr-4 text-center font-medium">
                    Nivel riesgo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entities.map((e) => (
                  <Row key={e.entidad} {...e} />
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Panel lateral de riesgo */}
        <div className="space-y-4">
          <SectionCard
            title="Riesgo consolidado"
            subtitle="Resumen ejecutivo por nivel de riesgo regulatorio."
          >
            <div className="space-y-3 text-xs">
              <RiskBar label="Crítico" value={2} total={3} tone="danger" />
              <RiskBar label="Alto" value={3} total={8} tone="warning" />
              <RiskBar label="Medio" value={5} total={8} tone="info" />
              <RiskBar label="Bajo" value={17} total={27} tone="success" />
            </div>
            <p className="mt-3 text-[11px] text-slate-500">
              El foco de gestión debe estar en las obligaciones de SUI y
              Superservicios con vencimiento próximo o vencidas.
            </p>
          </SectionCard>

          <SectionCard
            title="Notas ejecutivas"
            subtitle="Puntos clave para comité de cumplimiento."
          >
            <ul className="space-y-2 text-[11px] text-slate-600">
              <li>• No hay vencidos abiertos con la ANH.</li>
              <li>
                • SUI concentra el mayor número de reportes en riesgo alto por
                volumen y frecuencia.
              </li>
              <li>
                • El indicador global se mantiene sobre la meta (92% vs 90%).
              </li>
              <li>
                • Se recomienda reforzar los recordatorios tempranos a áreas
                operativas clave.
              </li>
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

/* Components */

function KpiCard({ label, value, helper, tone = "neutral" }) {
  const tones = {
    neutral:
      "border-slate-200 bg-white text-slate-900 shadow-[0_10px_25px_rgba(15,23,42,0.04)]",
    success:
      "border-emerald-100 bg-emerald-50 text-emerald-900 shadow-[0_10px_25px_rgba(16,185,129,0.15)]",
    warning:
      "border-amber-100 bg-amber-50 text-amber-900 shadow-[0_10px_25px_rgba(245,158,11,0.15)]",
    danger:
      "border-red-100 bg-red-50 text-red-900 shadow-[0_10px_25px_rgba(239,68,68,0.15)]",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 text-xs ${tones[tone]}`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-soft-light bg-[radial-gradient(circle_at_0_0,#ffffff,transparent_55%),radial-gradient(circle_at_100%_0,#e5e7eb,transparent_55%)]" />
      <div className="relative space-y-1">
        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-600">
          {label}
        </p>
        <p className="text-2xl font-semibold text-slate-900 leading-tight">
          {value}
        </p>
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

function Legend() {
  return (
    <div className="flex items-center gap-3">
      <LegendItem color="bg-emerald-500" label="Bajo" />
      <LegendItem color="bg-sky-500" label="Medio" />
      <LegendItem color="bg-amber-500" label="Alto" />
      <LegendItem color="bg-red-500" label="Crítico" />
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span className="text-[11px] text-slate-600">{label}</span>
    </span>
  );
}

function SectionCard({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {subtitle && (
          <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function RiskPill({ riesgo }) {
  const map = {
    Crítico: "bg-red-100 text-red-800",
    Alto: "bg-amber-100 text-amber-800",
    Medio: "bg-sky-100 text-sky-800",
    Bajo: "bg-emerald-100 text-emerald-800",
  };

  const cls = map[riesgo] || "bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium ${cls}`}
    >
      {riesgo}
    </span>
  );
}

function Row({ entidad, tiempo, pendientes, vencidos, riesgo, cumplimiento }) {
  const vencidosClass =
    Number(vencidos) > 0
      ? "text-red-600 font-semibold"
      : "text-slate-600 font-normal";

  return (
    <tr className="text-slate-700 hover:bg-slate-50/80 transition">
      <td className="py-2.5 pl-4 pr-2 text-[11px] font-semibold text-slate-900">
        {entidad}
      </td>
      <td className="py-2.5 pr-2 text-[11px] text-slate-600">{tiempo}</td>
      <td className="py-2.5 pr-2 text-[11px] text-slate-600">
        {pendientes}
      </td>
      <td className={`py-2.5 pr-2 text-[11px] ${vencidosClass}`}>
        {vencidos}
      </td>
      <td className="py-2.5 pr-2 text-[11px] text-slate-700">
        {cumplimiento}
      </td>
      <td className="py-2.5 pr-4 text-center">
        <RiskPill riesgo={riesgo} />
      </td>
    </tr>
  );
}

function RiskBar({ label, value, total, tone }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;

  const colors = {
    danger: "bg-red-500",
    warning: "bg-amber-500",
    info: "bg-sky-500",
    success: "bg-emerald-500",
    neutral: "bg-slate-400",
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px] text-slate-600">
        <span>{label}</span>
        <span>
          {value} reportes · {percent}%
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full ${colors[tone] || colors.neutral}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
