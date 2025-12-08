// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
   Helpers internos (sincronizados con Reports.jsx)
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

// Cálculo de último y próximo vencimiento 
function computePeriodDates(startDateStr, frecuencia) {
  const start = parseDateString(startDateStr);
  if (!start) return { lastDue: null, nextDue: null };

  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const freqMap = {
    Mensual: 1,
    Trimestral: 3,
    Semestral: 6,
    Anual: 12,
  };

  const valid = validateFrequency(frecuencia) || "Mensual";
  const step = freqMap[valid];

  let current = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  );
  let next = addMonthsSafe(current, step);

  while (next <= todayStart) {
    current = new Date(next);
    next = addMonthsSafe(next, step);
    if (next.getFullYear() > todayStart.getFullYear() + 10) break;
  }

  if (current > todayStart) {
    // aún no llega el primer vencimiento
    return { lastDue: null, nextDue: current };
  }

  return { lastDue: current, nextDue: next };
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
    (d.getFullYear() - now.getFullYear()) * 12 +
    (d.getMonth() - now.getMonth())
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

function loadReportsData() {
  try {
    const raw = localStorage.getItem("reportesCreados");
    const arr = raw ? JSON.parse(raw) : [];

    return arr
      .map((rep) => {
        const freq = rep.frecuencia || "Mensual";
        const baseDate = rep.fechaInicio || rep.fechaLimiteEnvio;

        const { lastDue, nextDue } = computePeriodDates(baseDate, freq);

        return {
          ...rep,
          lastDue,
          nextDue,
        };
      })
      .filter((r) => r.lastDue || r.nextDue)
      .sort((a, b) => {
        const da = a.nextDue || a.lastDue || new Date(8640000000000000);
        const db = b.nextDue || b.lastDue || new Date(8640000000000000);
        return da - db;
      });
  } catch (e) {
    console.error("Error cargando reportes desde localStorage", e);
    return [];
  }
}

function getExtendedDueDate(originalDueDate) {
  if (!originalDueDate) return null;
  const d =
    originalDueDate instanceof Date
      ? new Date(originalDueDate)
      : parseDateString(originalDueDate);
  if (!d) return null;
  d.setDate(d.getDate() + 2);
  return d;
}

// fecha del primer acuse cargado
function getFirstAcuseDate(reportId, attachmentsMap) {
  const list = (attachmentsMap[reportId] || []).filter(
    (a) => a.kind === "acuse"
  );
  if (!list.length) return null;

  const timestamps = list
    .map((a) => new Date(a.uploadedAt))
    .filter((d) => !isNaN(d));
  if (!timestamps.length) return null;

  return new Date(Math.min(...timestamps.map((d) => d.getTime())));
}

/**
 * Estados (alineados con Reports.jsx):
 * - "Dentro del plazo"  -> hoy <= due y SIN acuse
 * - "Pendiente"         -> hoy > due y hoy <= due+2 días y SIN acuse
 * - "Enviado a tiempo"  -> acuseDate <= due
 * - "Enviado tarde"     -> due < acuseDate <= due+2 días
 * - "Vencido"           -> hoy > due+2 días y SIN acuse
 */
function getReportStatus(report, attachmentsMap, todayStart) {
  const parseMaybeDate = (val) =>
    val instanceof Date ? val : val ? parseDateString(val) : null;

  let due = parseMaybeDate(report.lastDue) || parseMaybeDate(report.nextDue);
  if (!due || isNaN(due)) return "Dentro del plazo";

  const extended = getExtendedDueDate(due);
  const acuseDate = getFirstAcuseDate(report.id, attachmentsMap);

  // 1) Si hay acuse
  if (acuseDate) {
    if (acuseDate <= due) return "Enviado a tiempo";
    if (acuseDate > due && acuseDate <= extended) return "Enviado tarde";
    return "Vencido"; // acuse después de la ventana de gracia
  }

  // 2) Sin acuse
  if (todayStart <= due) return "Dentro del plazo";
  if (todayStart > due && todayStart <= extended) return "Pendiente";

  return "Vencido";
}

// Métricas globales basadas en estados
function calculateMetrics(reports, attachmentsMap) {
  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  let countOnTime = 0;
  let countInWindow = 0; // Dentro del plazo
  let countPending = 0; // en ventana de gracia
  let countLate = 0; // Enviado tarde
  let countOverdue = 0;

  reports.forEach((r) => {
    const st = getReportStatus(r, attachmentsMap, todayStart);
    switch (st) {
      case "Enviado a tiempo":
        countOnTime++;
        break;
      case "Dentro del plazo":
        countInWindow++;
        break;
      case "Pendiente":
        countPending++;
        break;
      case "Enviado tarde":
        countLate++;
        break;
      case "Vencido":
        countOverdue++;
        break;
      default:
        break;
    }
  });

  const totalReports = reports.length;
  const countOnTimeOrWindow = countOnTime + countInWindow;
  const percentOnTime = totalReports
    ? Math.round((countOnTimeOrWindow / totalReports) * 100)
    : 0;

  return {
    totalReports,
    countOnTime,
    countInWindow,
    countPending,
    countLate,
    countOverdue,
    percentOnTime,
  };
}

// Próximos vencimientos (solo no enviados)
function getUpcomingReports(reports, attachmentsMap, daysWindow = 15) {
  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  return reports
    .filter((r) => {
      const st = getReportStatus(r, attachmentsMap, todayStart);

      // seguimos excluyendo enviados y vencidos
      if (
        st === "Enviado a tiempo" ||
        st === "Enviado tarde" ||
        st === "Vencido"
      ) {
        return false;
      }

      const due =
        r.lastDue instanceof Date
          ? r.lastDue
          : r.lastDue
          ? parseDateString(r.lastDue)
          : r.nextDue instanceof Date
          ? r.nextDue
          : r.nextDue
          ? parseDateString(r.nextDue)
          : null;

      if (!due) return false;

      const diff = daysUntil(due);
      if (diff === null || diff < 0) return false; // solo futuros

      // si daysWindow es null, no limitamos por días
      if (daysWindow == null) return true;

      return diff <= daysWindow;
    })
    .sort((a, b) => {
      const da = a.lastDue || a.nextDue;
      const db = b.lastDue || b.nextDue;
      const daDiff = daysUntil(da);
      const dbDiff = daysUntil(db);
      return (daDiff ?? 99999) - (dbDiff ?? 99999);
    });
}


// Riesgo por entidad basado en "Vencido"
function getRiskByEntity(reports, attachmentsMap) {
  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const map = {};

  reports.forEach((r) => {
    const entidad = r.entidadControl || r.entity || "Otros";
    const st = getReportStatus(r, attachmentsMap, todayStart);

    if (!map[entidad]) {
      map[entidad] = { entidad, total: 0, vencidos: 0 };
    }
    map[entidad].total += 1;
    if (st === "Vencido") map[entidad].vencidos += 1;
  });

  return Object.values(map)
    .map((e) => ({
      ...e,
      riesgo: e.total ? Math.round((e.vencidos / e.total) * 100) : 0,
    }))
    .sort((a, b) => b.riesgo - a.riesgo || b.vencidos - a.vencidos);
}

// Nueva: tendencia de estados por mes (cumplidos, dentro, pendiente, vencido)
function getStatusTrend(reports, attachmentsMap, monthsBack = 5) {
  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const start = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1), 1);

  const buckets = new Map();

  for (let i = 0; i < monthsBack; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    buckets.set(key, {
      mes: `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`,
      total: 0,
      cumplidos: 0,  // seguimos contando por si acaso
      dentro: 0,
      pendiente: 0,
      vencido: 0,
    });
  }

  reports.forEach((r) => {
    const due = r.lastDue || r.nextDue;
    if (!due) return;

    const d = due instanceof Date ? due : parseDateString(due);
    if (!d) return;

    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = buckets.get(key);
    if (!bucket) return;

    const st = getReportStatus(r, attachmentsMap, todayStart);

    bucket.total += 1;

    switch (st) {
      case "Enviado a tiempo":
      case "Enviado tarde":
        bucket.cumplidos += 1;
        break;
      case "Dentro del plazo":
        bucket.dentro += 1;
        break;
      case "Pendiente":
        bucket.pendiente += 1;
        break;
      case "Vencido":
        bucket.vencido += 1;
        break;
      default:
        break;
    }
  });

  return Array.from(buckets.values()).map((b) => {
    const t = b.total || 1;
    return {
      mes: b.mes,
      total: b.total,
      dentroPct: b.total ? Math.round((b.dentro / t) * 100) : 0,
      pendientePct: b.total ? Math.round((b.pendiente / t) * 100) : 0,
      vencidoPct: b.total ? Math.round((b.vencido / t) * 100) : 0,
    };
  });
}


// Distribución para el pie chart
function buildStatusDistribution(calc) {
  const dist = [
    { name: "Dentro del plazo", value: calc.countInWindow },
    { name: "Pendientes", value: calc.countPending },
    { name: "Enviado a tiempo", value: calc.countOnTime },
    { name: "Enviado tarde", value: calc.countLate },
    { name: "Vencidos", value: calc.countOverdue },
  ];
  return dist.filter((x) => x.value > 0);
}

/* =========================================================
   Componente Dashboard
   ========================================================= */

// Colores más fuertes por estado (para el pie)
const STATUS_COLORS = {
  "Dentro del plazo": "#0284c7", 
  Pendientes: "#f97316", 
  "Enviado a tiempo": "#16a34a", 
  "Enviado tarde": "#eab308", 
  Vencidos: "#dc2626", 
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [metrics, setMetrics] = useState({
    totalReports: 0,
    countOnTime: 0,
    countInWindow: 0,
    countPending: 0,
    countLate: 0,
    countOverdue: 0,
    percentOnTime: 0,
  });
  const [upcomingReports, setUpcomingReports] = useState([]);
  const [riskByEntity, setRiskByEntity] = useState([]);
  const [statusTrend, setStatusTrend] = useState([]); // ← nueva serie multi-estado
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [lastRefresh, setLastRefresh] = useState(null);

  // attachmentsMap se comparte con Reports (solo lectura aquí)
  const [attachmentsMap] = useState(() => {
    try {
      const raw = localStorage.getItem("reportAttachments");
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    const loadData = () => {
      const allReports = loadReportsData();
      setReports(allReports);

      const calc = calculateMetrics(allReports, attachmentsMap);
      setMetrics(calc);

      const upcoming = getUpcomingReports(allReports, attachmentsMap, null);
      setUpcomingReports(upcoming);

      const riskRaw = getRiskByEntity(allReports, attachmentsMap);

      const MAX_BARS = 10; // número máximo de barras visibles
      let riskData = riskRaw;

      if (riskRaw.length > MAX_BARS) {
        const top = riskRaw.slice(0, MAX_BARS - 1); // top 9
        const rest = riskRaw.slice(MAX_BARS - 1); // el resto

        const aggTotal = rest.reduce((acc, r) => acc + r.total, 0);
        const aggVenc = rest.reduce((acc, r) => acc + r.vencidos, 0);

        const agg = {
          entidad: "Otros",
          total: aggTotal,
          vencidos: aggVenc,
          riesgo: aggTotal ? Math.round((aggVenc / aggTotal) * 100) : 0,
        };

        riskData = [...top, agg];
      }

      setRiskByEntity(riskData);

      //tendencia por estado
      const trend = getStatusTrend(allReports, attachmentsMap, 3);
      setStatusTrend(trend);

      const distribution = buildStatusDistribution(calc);
      setStatusDistribution(distribution);

      setLastRefresh(new Date());
    };

    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [attachmentsMap]);

  const nextVencimiento = upcomingReports[0];
  const baseDueNext =
    nextVencimiento && (nextVencimiento.lastDue || nextVencimiento.nextDue);
  const diasParaVencimiento = baseDueNext ? daysUntil(baseDueNext) : null;

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
            Visibilidad ejecutiva sobre vencimientos, cumplimiento y riesgo por
            entidad.
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
          subtitle={
            hasData
              ? `${metrics.countOnTime + metrics.countInWindow} de ${
                  metrics.totalReports
                } reportes a tiempo o dentro del plazo`
              : "Sin datos de cumplimiento"
          }
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
          subtitle={
            hasData
              ? `${metrics.countInWindow} dentro del plazo, ${metrics.countPending} pendientes, ${metrics.countLate} enviados tarde`
              : "Configura reportes en el módulo de portafolio"
          }
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
        {/* Evolución de estados */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col">
          <HeaderCard
            title="Evolución de estados"
            subtitle="Porcentaje de reportes por estado ( Dentro del plazo, pendiente, vencido)"
            pill="Últimos 3 meses"
          />
          <div className="mt-4 h-64 flex items-center justify-center">
            {statusTrend.length === 0 ? (
              <p className="text-[11px] text-slate-500">
                Aún no hay suficientes datos para graficar la tendencia.
              </p>
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
                minWidth={0}
                minHeight={0}
              >
                <LineChart data={statusTrend} margin={{ left: -24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                  <YAxis unit="%" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 12,
                      borderColor: "#e5e7eb",
                    }}
                    formatter={(value, name, { payload }) => {
                      // value ya viene como porcentaje
                      const mapLabel = {
                        cumplidosPct: "Cumplidos",
                        dentroPct: "Dentro del plazo",
                        pendientePct: "Pendiente",
                        vencidoPct: "Vencido",
                      };
                      const prettyName = mapLabel[name] || name;
                      return [`${value}%`, prettyName];
                    }}
                    labelFormatter={(label, payload) => {
                      const p = payload && payload[0]?.payload;
                      if (!p) return label;
                      return `${label} · Total: ${p.total}`;
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 11 }}
                    formatter={(value) => {
                      const map = {
                        cumplidosPct: "Cumplidos",
                        dentroPct: "Dentro del plazo",
                        pendientePct: "Pendiente",
                        vencidoPct: "Vencido",
                      };
                      return map[value] || value;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="cumplidosPct"
                    stroke="#16a34a"
                    strokeWidth={2.2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="dentroPct"
                    stroke="#0284c7"
                    strokeWidth={2.2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pendientePct"
                    stroke="#f97316"
                    strokeWidth={2.2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="vencidoPct"
                    stroke="#dc2626"
                    strokeWidth={2.2}
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
                  Aún no hay distribución disponible. Crea reportes en el módulo
                  de portafolio.
                </p>
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  minWidth={0}
                  minHeight={0}
                >
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
                          fill={STATUS_COLORS[entry.name] || "#64748b"}
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
            <button
              className="text-[11px] px-2.5 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50"
              onClick={() => navigate("/reports")}
            >
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
              {upcomingReports.slice(0, 10).map((r) => {
                const dueDate = r.lastDue || r.nextDue;
                return (
                  <ReportRow
                    key={r.id}
                    name={r.nombreReporte}
                    entity={r.entidadControl || "-"}
                    owner={r.responsableElaboracionName || "-"}
                    due={formatDate(dueDate)}
                    days={daysUntil(dueDate)}
                  />
                );
              })}
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
                  Aún no hay suficientes datos para calcular el riesgo por
                  entidad.
                </p>
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  minWidth={0}
                  minHeight={0}
                >
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
