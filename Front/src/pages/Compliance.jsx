// src/pages/Compliance.jsx
import React, { useMemo, useState } from "react";

export default function Compliance() {
  // --- Datos que vendrán del backend ---
  // TODO: reemplazar estos useState por un fetch/useQuery contra tu API
  const [entities, setEntities] = useState([]); // [{ entidad, tiempo, pendientes, vencidos, riesgo, cumplimiento }]
  const [riskSummary, setRiskSummary] = useState({
    critico: 0,
    alto: 0,
    medio: 0,
    bajo: 0,
    total: 0,
  });
  const [executiveNotes, setExecutiveNotes] = useState([]); // ['nota 1', 'nota 2', ...]

  // --- Estado de filtros ---
  const [period, setPeriod] = useState("Periodo actual");
  const [entityFilter, setEntityFilter] = useState("Todas");
  const [riskFilter, setRiskFilter] = useState("Todos");

  // Opciones dinámicas para entidades (según datos del backend)
  const entityOptions = useMemo(() => {
    const base = ["Todas"];
    const uniques = Array.from(new Set(entities.map((e) => e.entidad)));
    return [...base, ...uniques];
  }, [entities]);

  const riskOptions = ["Todos", "Bajo", "Medio", "Alto", "Crítico"];

  // --- Aplicar filtros a las entidades ---
  const filteredEntities = useMemo(() => {
    return entities.filter((e) => {
      if (entityFilter !== "Todas" && e.entidad !== entityFilter) return false;
      if (riskFilter !== "Todos" && e.riesgo !== riskFilter) return false;
      return true;
    });
  }, [entities, entityFilter, riskFilter]);

  // --- Métricas calculadas a partir de TODAS las entidades (visión global) ---
  const globalMetrics = useMemo(() => {
    if (!entities || entities.length === 0) {
      return {
        vencidos: 0,
        pendientes: 0,
        cumplimientoYTD: "—",
        entidadesActivas: 0,
        totalReportes: 0,
      };
    }

    const totalVencidos = entities.reduce(
      (acc, e) => acc + (Number(e.vencidos) || 0),
      0
    );
    const totalPendientes = entities.reduce(
      (acc, e) => acc + (Number(e.pendientes) || 0),
      0
    );

    const cumplimientoValues = entities
      .map((e) => {
        if (typeof e.cumplimiento === "number") return e.cumplimiento;
        if (typeof e.cumplimiento === "string") {
          const n = parseInt(e.cumplimiento.replace("%", ""), 10);
          return isNaN(n) ? null : n;
        }
        return null;
      })
      .filter((v) => v !== null);

    const avgCumplimiento =
      cumplimientoValues.length > 0
        ? cumplimientoValues.reduce((a, b) => a + b, 0) /
          cumplimientoValues.length
        : null;

    const totalReportes = entities.reduce((acc, e) => {
      const t = Number(e.tiempo) || 0;
      const p = Number(e.pendientes) || 0;
      const v = Number(e.vencidos) || 0;
      return acc + t + p + v;
    }, 0);

    return {
      vencidos: totalVencidos,
      pendientes: totalPendientes,
      cumplimientoYTD:
        avgCumplimiento !== null ? `${Math.round(avgCumplimiento)}%` : "—",
      entidadesActivas: entities.length,
      totalReportes,
    };
  }, [entities]);

  // --- Índice de riesgo regulatorio calculado desde riskSummary ---
  const riskIndexLabel = useMemo(() => {
    if (!riskSummary || !riskSummary.total) return "—";
    const high =
      (riskSummary.critico || 0) + (riskSummary.alto || 0);
    const ratio = high / riskSummary.total;
    if (ratio >= 0.5) return "Alto";
    if (ratio >= 0.2) return "Medio";
    return "Bajo";
  }, [riskSummary]);

  return (
    <div className="space-y-6">
      {/* KPIs de cumplimiento (visión global) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard
          label="Cumplimiento a tiempo (YTD)"
          value={globalMetrics.cumplimientoYTD}
          helper="Porcentaje de reportes enviados dentro del plazo."
          tone="success"
        />
        <KpiCard
          label="Reportes vencidos"
          value={globalMetrics.vencidos}
          helper="Cantidad total de reportes cuyo vencimiento ya pasó."
          tone="danger"
        />
        <KpiCard
          label="Pendientes por cerrar"
          value={globalMetrics.pendientes}
          helper="Obligaciones en curso con vencimiento activo."
          tone="warning"
        />
        <KpiCard
          label="Índice de riesgo regulatorio"
          value={riskIndexLabel}
          helper="Calculado según la distribución de reportes por nivel de riesgo."
          tone="neutral"
        />
      </div>

      {/* Filtros y contexto */}
      <div className="bg-white rounded-2xl border border-slate-200 px-4 py-4 md:px-5 md:py-4 flex flex-col gap-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-3 text-xs">
            <Select
              label="Periodo"
              value={period}
              options={["Periodo actual", "Periodo anterior"]}
              onChange={setPeriod}
            />
            <Select
              label="Entidad"
              value={entityFilter}
              options={entityOptions}
              onChange={setEntityFilter}
            />
            <Select
              label="Nivel de riesgo"
              value={riskFilter}
              options={riskOptions}
              onChange={setRiskFilter}
            />
          </div>

          <p className="text-[11px] text-slate-500 max-w-md md:text-right">
            Vista consolidada del estado de cumplimiento por entidad reguladora.
            Usa los filtros para priorizar acciones sobre vencidos, pendientes y
            reportes en zona de riesgo.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-[11px] text-slate-500">
          <span>
            {filteredEntities.length} entidades visibles ·{" "}
            {globalMetrics.totalReportes} reportes en el portafolio de
            cumplimiento.
          </span>
          <Legend />
        </div>
      </div>

      {/* Cuerpo principal: tabla + riesgo consolidado */}
      <div className="grid lg:grid-cols-[1.5fr,1.1fr] gap-4">
        {/* Tabla por entidad (filtrada) */}
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
                {filteredEntities.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-4 pl-4 pr-4 text-[11px] text-slate-500 text-center"
                    >
                      No hay entidades que cumplan con los filtros
                      seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredEntities.map((e) => (
                    <Row key={e.entidad} {...e} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Panel lateral de riesgo + notas ejecutivas */}
        <div className="space-y-4">
          <SectionCard
            title="Riesgo consolidado"
            subtitle="Resumen ejecutivo por nivel de riesgo regulatorio."
          >
            <div className="space-y-3 text-xs">
              <RiskBar
                label="Crítico"
                value={riskSummary.critico || 0}
                total={riskSummary.total || 0}
                tone="danger"
              />
              <RiskBar
                label="Alto"
                value={riskSummary.alto || 0}
                total={riskSummary.total || 0}
                tone="warning"
              />
              <RiskBar
                label="Medio"
                value={riskSummary.medio || 0}
                total={riskSummary.total || 0}
                tone="info"
              />
              <RiskBar
                label="Bajo"
                value={riskSummary.bajo || 0}
                total={riskSummary.total || 0}
                tone="success"
              />
            </div>
            <p className="mt-3 text-[11px] text-slate-500">
              El foco de gestión debe estar en las obligaciones con vencimiento
              próximo o vencidas según lo definido por el backend.
            </p>
          </SectionCard>

          <SectionCard
            title="Notas ejecutivas"
            subtitle="Puntos clave para comité de cumplimiento."
          >
            {executiveNotes.length === 0 ? (
              <p className="text-[11px] text-slate-500">
                No hay notas ejecutivas disponibles. Se mostrarán aquí cuando el
                backend las provea.
              </p>
            ) : (
              <ul className="space-y-2 text-[11px] text-slate-600">
                {executiveNotes.map((note, idx) => (
                  <li key={idx}>• {note}</li>
                ))}
              </ul>
            )}
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

function Select({ label, value, options, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
        {label}
      </span>
      <div className="relative">
        <select
          className="appearance-none inline-flex w-40 items-center justify-between rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-700 hover:bg-slate-50 pr-7 focus:outline-none focus:ring-2 focus:ring-slate-200"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2 top-1.5 text-xs text-slate-400">
          ▾
        </span>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-3">
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
      <td className="py-2.5 pr-2 text-[11px] text-slate-600">
        {tiempo ?? "—"}
      </td>
      <td className="py-2.5 pr-2 text-[11px] text-slate-600">
        {pendientes ?? "—"}
      </td>
      <td className={`py-2.5 pr-2 text-[11px] ${vencidosClass}`}>
        {vencidos ?? "—"}
      </td>
      <td className="py-2.5 pr-2 text-[11px] text-slate-700">
        {cumplimiento ?? "—"}
      </td>
      <td className="py-2.5 pr-4 text-center">
        <RiskPill riesgo={riesgo || "—"} />
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
