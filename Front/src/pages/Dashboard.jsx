// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";

/* =========================================================
   Helpers internos (antes venían de ../utils/dashboardHelpers)
   ========================================================= */

// Parseo de fechas
function parseDateString(dateStr) {
  if (!dateStr) return null;

  const iso = new Date(dateStr);
  if (!isNaN(iso)) return iso;

  const parts = String(dateStr).split("/");
  if (parts.length === 3) {
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const y = parseInt(parts[2], 10);
    return new Date(y, m, d);
  }

  return null;
}

// Normalización de frecuencia
function validateFrequency(f) {
  if (!f && f !== "") return null;
  const s = String(f).trim().toLowerCase();
  if (s === "mensual" || s === "monthly") return "Mensual";
  if (s === "trimestral") return "Trimestral";
  if (s === "semestral") return "Semestral";
  if (s === "anual" || s === "annual") return "Anual";
  return null;
}

function addMonthsSafe(date, months) {
  const d = new Date(date.getTime());
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  if (d.getDate() !== day) {
    d.setDate(0);
  }
  return d;
}

function computeNextDue(startDateStr, frecuencia) {
  const start = parseDateString(startDateStr);
  if (!start) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let next = new Date(start.getFullYear(), start.getMonth(), start.getDate());

  const freqMap = {
    Mensual: 1,
    Trimestral: 3,
    Semestral: 6,
    Anual: 12,
  };
  const valid = validateFrequency(frecuencia) || "Mensual";
  const step = freqMap[valid];

  while (next <= today) {
    next = addMonthsSafe(next, step);
    if (next.getFullYear() > now.getFullYear() + 10) break;
  }
  return next;
}

function formatDate(d) {
  if (!d) return "-";
  const date = d instanceof Date ? d : parseDateString(d);
  if (!date) return "-";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function monthsUntil(date) {
  if (!date) return null;
  const d = date instanceof Date ? date : parseDateString(date);
  if (!d) return null;
  const now = new Date();
  return (
    (d.getFullYear() - now.getFullYear()) * 12 + (d.getMonth() - now.getMonth())
  );
}

function daysUntil(date) {
  if (!date) return null;
  const d = date instanceof Date ? date : parseDateString(date);
  if (!d) return null;

  const now = new Date();
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

function criticidadFromMonths(months) {
  if (months === null || months === undefined) return "-";
  if (months <= 1) return "Crítica";
  if (months >= 2 && months <= 6) return "Alta";
  if (months >= 7 && months <= 10) return "Media";
  return "Baja";
}

// Cargar reportes desde localStorage y calcular nextDue
function loadReportsData() {
  try {
    const raw = localStorage.getItem("reportesCreados");
    const arr = raw ? JSON.parse(raw) : [];

    return arr
      .map((rep) => {
        const freq = rep.frecuencia || "Mensual";
        const nextDue = computeNextDue(rep.fechaInicio, freq);
        return { ...rep, nextDue };
      })
      .filter((r) => r.nextDue != null)
      .sort((a, b) => a.nextDue - b.nextDue);
  } catch (e) {
    console.error("Error cargando reportes desde localStorage", e);
    return [];
  }
}

// Métricas globales
function calculateMetrics(reports) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const totalReports = reports.length;

  const countOverdue = reports.filter((r) => {
    if (!r.nextDue) return false;
    const d = r.nextDue instanceof Date ? r.nextDue : parseDateString(r.nextDue);
    if (!d) return false;
    const extended = new Date(d);
    extended.setDate(extended.getDate() + 2);
    return extended < today;
  }).length;

  const countActive = reports.filter((r) => {
    if (!r.nextDue) return false;
    const d = r.nextDue instanceof Date ? r.nextDue : parseDateString(r.nextDue);
    if (!d) return false;
    return d > today;
  }).length;

  const countPending = Math.max(0, totalReports - countActive - countOverdue);

  const percentOnTime = totalReports
    ? Math.round((countActive / totalReports) * 100)
    : 0;

  return {
    totalReports,
    countActive,
    countPending,
    countOverdue,
    percentOnTime,
  };
}

// Próximos vencimientos
function getUpcomingReports(reports, daysWindow = 15) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return reports
    .filter((r) => {
      if (!r.nextDue) return false;
      const d = r.nextDue instanceof Date ? r.nextDue : parseDateString(r.nextDue);
      if (!d) return false;
      const diff = (d - today) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= daysWindow;
    })
    .sort((a, b) => a.nextDue - b.nextDue);
}

// Riesgo por entidad
function getRiskByEntity(reports) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const map = {};

  reports.forEach((r) => {
    const entidad = r.entidadControl || r.entity || "Otros";
    if (!r.nextDue) return;
    const d = r.nextDue instanceof Date ? r.nextDue : parseDateString(r.nextDue);
    if (!d) return;

    const extended = new Date(d);
    extended.setDate(extended.getDate() + 2);
    const isOverdue = extended < today;

    if (!map[entidad]) {
      map[entidad] = { entidad, total: 0, vencidos: 0 };
    }
    map[entidad].total += 1;
    if (isOverdue) map[entidad].vencidos += 1;
  });

  return Object.values(map)
    .map((e) => ({
      ...e,
      riesgo: e.total ? Math.round((e.vencidos / e.total) * 100) : 0,
    }))
    .sort((a, b) => b.riesgo - a.riesgo || b.vencidos - a.vencidos);
}

// Tendencia de cumplimiento (últimos N meses)
function getComplianceTrend(reports, monthsBack = 5) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1), 1);

  const buckets = new Map();

  for (let i = 0; i < monthsBack; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    buckets.set(key, {
      mes: `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`,
      total: 0,
      ontime: 0,
    });
  }

  reports.forEach((r) => {
    if (!r.nextDue) return;
    const d = r.nextDue instanceof Date ? r.nextDue : parseDateString(r.nextDue);
    if (!d) return;

    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = buckets.get(key);
    if (!bucket) return;

    bucket.total += 1;

    const extended = new Date(d);
    extended.setDate(extended.getDate() + 2);
    const isOverdue = extended < today;
    if (!isOverdue) bucket.ontime += 1;
  });

  return Array.from(buckets.values()).map((b) => ({
    mes: b.mes,
    cumplimiento: b.total ? Math.round((b.ontime / b.total) * 100) : 0,
  }));
}

/* =========================================================
   Componente Dashboard
   ========================================================= */

const STATUS_COLORS = ["#16a34a", "#f59e0b", "#0f172a", "#dc2626"];

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [metrics, setMetrics] = useState({
    totalReports: 0,
    countActive: 0,
    countPending: 0,
    countOverdue: 0,
    percentOnTime: 0,
  });
  const [upcomingReports, setUpcomingReports] = useState([]);
  const [riskByEntity, setRiskByEntity] = useState([]);
  const [complianceTrend, setComplianceTrend] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [lastRefresh, setLastRefresh] = useState(null);

  useEffect(() => {
    const loadData = () => {
      const allReports = loadReportsData();
      setReports(allReports);

      const calc = calculateMetrics(allReports);
      setMetrics(calc);

      const upcoming = getUpcomingReports(allReports, 15);
      setUpcomingReports(upcoming);

      const riskData = getRiskByEntity(allReports);
      setRiskByEntity(riskData);

      const trend = getComplianceTrend(allReports, 5);
      setComplianceTrend(trend);

      const distribution = [
        { name: "A tiempo", value: calc.countActive },
        { name: "Pendientes", value: calc.countPending },
        { name: "Vencidos", value: calc.countOverdue },
      ].filter((x) => x.value > 0);
      setStatusDistribution(distribution);

      setLastRefresh(new Date());
    };

    loadData();
    // Si luego conectas backend, aquí reemplazas loadReportsData por un fetch.
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextVencimiento = upcomingReports[0];
  const diasParaVencimiento = nextVencimiento
    ? daysUntil(nextVencimiento.nextDue)
    : null;
  const entidadConMasRiesgo = riskByEntity[0]?.entidad || "-";
  const entidadesConRiesgo = riskByEntity.filter(
    (e) => e.vencidos > 0 || e.riesgo > 0
  ).length;
  const hasData = metrics.totalReports > 0;

  return (
    <div className="space-y-6">
      {/* Header mini ejecutivo */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            Tablero regulatorio
          </h1>
          <p className="text-xs text-slate-500">
            Visibilidad ejecutiva sobre vencimientos, cumplimiento y riesgo por entidad.
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span className="hidden sm:inline">
            {hasData
              ? `${metrics.totalReports} reportes en portafolio`
              : "Sin reportes configurados aún"}
          </span>
          {lastRefresh && (
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 bg-white">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Última actualización:{" "}
              {lastRefresh.toLocaleString("es-CO", {
                hour12: false,
              })}
            </span>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard
          title="% Cumplimiento a tiempo"
          value={`${metrics.percentOnTime}%`}
          subtitle={`${metrics.countActive} de ${metrics.totalReports} reportes`}
          status={hasData ? "Dinámico" : "Sin datos"}
        />
        <KpiCard
          title="Reportes vencidos"
          value={metrics.countOverdue}
          subtitle={`${
            metrics.countOverdue > 0 ? "⚠️ Requieren atención" : "✓ Sin vencidos"
          }`}
          variant={metrics.countOverdue > 0 ? "danger" : "success"}
        />
        <KpiCard
          title="Reportes totales"
          value={metrics.totalReports}
          subtitle={`${metrics.countActive} a tiempo, ${metrics.countPending} pendientes`}
          variant="neutral"
        />
        <KpiCard
          title="Entidades con riesgo"
          value={entidadesConRiesgo}
          subtitle={
            hasData
              ? `${entidadConMasRiesgo} con mayor riesgo`
              : "Configura reportes para ver riesgo"
          }
          variant={entidadesConRiesgo > 0 ? "warning" : "success"}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Cumplimiento mensual */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col">
          <HeaderCard
            title="Evolución de cumplimiento"
            subtitle="Porcentaje de reportes enviados a tiempo por mes"
            pill="Últimos 5 meses"
          />
          <div className="mt-4 h-64 flex items-center justify-center">
            {complianceTrend.length === 0 ? (
              <p className="text-[11px] text-slate-500">
                Aún no hay suficientes datos para graficar la tendencia de cumplimiento.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <LineChart data={complianceTrend} margin={{ left: -24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                  <YAxis unit="%" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 12,
                      borderColor: "#e5e7eb",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="cumplimiento"
                    stroke="#0f766e"
                    strokeWidth={2.4}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Distribución de estados */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col">
          <HeaderCard
            title="Estado de los reportes"
            subtitle="Distribución actual del portafolio"
          />
          <div className="mt-2 flex-1 flex flex-col">
            <div className="h-48 flex items-center justify-center">
              {statusDistribution.length === 0 ? (
                <p className="text-[11px] text-slate-500">
                  Aún no hay distribución disponible. Crea reportes en el módulo de
                  portafolio.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 12,
                        borderColor: "#e5e7eb",
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
              <MiniMetric
                label="Nivel de servicio"
                value={hasData ? `${metrics.percentOnTime}%` : "-"}
                desc="Meta 90%"
              />
              <MiniMetric
                label="Backlog operativo"
                value={
                  hasData ? metrics.countPending + metrics.countOverdue : "-"
                }
                desc="Pendientes + vencidos"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lower row: tabla + riesgo por entidad + resumen */}
      <div className="grid grid-cols-1 2xl:grid-cols-3 gap-4">
        {/* Próximos vencimientos */}
        <div className="2xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <HeaderCard
              title="Próximos vencimientos"
              subtitle={
                hasData
                  ? `${upcomingReports.length} obligaciones en los próximos 15 días`
                  : "Configura reportes para ver vencimientos"
              }
            />
            <button className="text-[11px] px-2.5 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50">
              Ver todos
            </button>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="border-y border-slate-200 bg-slate-50/60 text-slate-500">
              <tr>
                <th className="py-2 pl-2 font-medium">Reporte</th>
                <th className="py-2 font-medium">Entidad</th>
                <th className="py-2 font-medium">Responsable</th>
                <th className="py-2 font-medium">Vence</th>
                <th className="py-2 text-center font-medium">Días</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {upcomingReports.slice(0, 4).map((r) => (
                <ReportRow
                  key={r.id}
                  name={r.nombreReporte}
                  entity={r.entidadControl || "-"}
                  owner={r.responsableElaboracionName || "-"}
                  due={formatDate(r.nextDue)}
                  days={daysUntil(r.nextDue)}
                />
              ))}
              {upcomingReports.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="py-4 text-center text-slate-500 text-[11px]"
                  >
                    No hay reportes venciendo en los próximos 15 días.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Riesgo por entidad + resumen ejecutivo */}
        <div className="space-y-4">
          {/* Riesgo por entidad */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
            <HeaderCard
              title="Riesgo por entidad"
              subtitle={
                hasData
                  ? `${riskByEntity.length} entidades en portafolio`
                  : "Sin entidades con reportes configurados"
              }
            />
            <div className="mt-4 h-40 flex items-center justify-center">
              {riskByEntity.length === 0 ? (
                <p className="text-[11px] text-slate-500">
                  Aún no hay suficientes datos para calcular el riesgo por entidad.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart data={riskByEntity} barSize={16}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e5e7eb"
                    />
                    <XAxis
                      dataKey="entidad"
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 12,
                        borderColor: "#e5e7eb",
                      }}
                    />
                    <Bar dataKey="vencidos" name="Vencidos" fill="#dc2626" />
                    <Bar dataKey="riesgo" name="% Riesgo" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Resumen ejecutivo */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
            <HeaderCard
              title="Resumen ejecutivo"
              subtitle="Indicadores clave de rendimiento"
            />
            <ul className="mt-3 space-y-2 text-[11px]">
              <li className="flex justify-between items-center p-2 bg-slate-50 rounded">
                <span className="text-slate-600">Próximo vencimiento:</span>
                <span className="font-medium">
                  {nextVencimiento && diasParaVencimiento !== null
                    ? `${diasParaVencimiento} días`
                    : "Sin próximos"}
                </span>
              </li>
              <li className="flex justify-between items-center p-2 bg-slate-50 rounded">
                <span className="text-slate-600">Entidad con más riesgo:</span>
                <span className="font-medium">{entidadConMasRiesgo}</span>
              </li>
              <li className="flex justify-between items-center p-2 bg-slate-50 rounded">
                <span className="text-slate-600">Portafolio total:</span>
                <span className="font-medium">
                  {metrics.totalReports} reportes
                </span>
              </li>
              <li className="flex justify-between items-center p-2 bg-slate-50 rounded">
                <span className="text-slate-600">Tasa de cumplimiento:</span>
                <span
                  className={`font-medium ${
                    metrics.percentOnTime >= 85
                      ? "text-emerald-600"
                      : "text-amber-600"
                  }`}
                >
                  {metrics.percentOnTime}%
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================== Subcomponentes ================== */

function HeaderCard({ title, subtitle, pill }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {subtitle && (
          <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      {pill && (
        <span className="inline-flex items-center rounded-full bg-slate-100 text-[10px] px-2 py-1 text-slate-600">
          {pill}
        </span>
      )}
    </div>
  );
}

function KpiCard({ title, value, subtitle, variant = "success", status }) {
  const variants = {
    success:
      "bg-emerald-50 border-emerald-100 text-emerald-900 shadow-[0_10px_40px_rgba(16,185,129,0.18)]",
    danger:
      "bg-red-50 border-red-100 text-red-900 shadow-[0_10px_40px_rgba(239,68,68,0.16)]",
    warning:
      "bg-amber-50 border-amber-100 text-amber-900 shadow-[0_10px_40px_rgba(245,158,11,0.15)]",
    neutral: "bg-white border-slate-200 text-slate-900 shadow-sm",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 text-xs ${variants[variant]}`}
    >
      <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-soft-light bg-[radial-gradient(circle_at_0_0,#ffffff,transparent_55%),radial-gradient(circle_at_100%_0,#e5e7eb,transparent_55%)]" />
      <div className="relative space-y-1">
        <p className="text-[11px] uppercase tracking-[0.18em] opacity-80">
          {title}
        </p>
        <p className="text-2xl font-semibold leading-tight">{value}</p>
        {subtitle && <p className="text-[11px] opacity-75">{subtitle}</p>}
        {status && (
          <span className="inline-flex mt-1 rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-medium">
            {status}
          </span>
        )}
      </div>
    </div>
  );
}

function MiniMetric({ label, value, desc }) {
  return (
    <div className="border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/60">
      <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500 mb-1">
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
      {desc && <p className="text-[10px] text-slate-500 mt-0.5">{desc}</p>}
    </div>
  );
}

function ReportRow({ name, entity, owner, due, days }) {
  const getDayColor = (d) => {
    if (d === null) return "text-slate-600";
    if (d < 0) return "text-red-600 font-semibold";
    if (d <= 3) return "text-amber-600 font-semibold";
    return "text-slate-600";
  };

  return (
    <tr className="text-slate-700 hover:bg-slate-50/80 transition">
      <td className="py-2.5 pl-2 pr-2">
        <p className="font-medium text-[11px]">{name}</p>
      </td>
      <td className="py-2.5 pr-2 text-[11px] text-slate-600">{entity}</td>
      <td className="py-2.5 pr-2 text-[11px] text-slate-600">{owner}</td>
      <td className="py-2.5 pr-2 text-[11px] text-slate-600">{due}</td>
      <td
        className={`py-2.5 pr-2 text-center text-[11px] font-medium ${getDayColor(
          days
        )}`}
      >
        {days !== null ? `${days}d` : "-"}
      </td>
    </tr>
  );
}

function TimelineItem({ time, title, detail, badge }) {
  return (
    <li className="flex gap-3">
      <div className="pt-1">
        <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className="text-[11px] font-semibold text-slate-800">{title}</p>
          {badge && (
            <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
              {badge}
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-500">{detail}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">{time}</p>
      </div>
    </li>
  );
}
