// src/pages/Dashboard.jsx
import React from "react";
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

const complianceTrend = [
  { mes: "Ago", cumplimiento: 86 },
  { mes: "Sep", cumplimiento: 88 },
  { mes: "Oct", cumplimiento: 90 },
  { mes: "Nov", cumplimiento: 92 },
  { mes: "Dic", cumplimiento: 94 },
];

const statusDistribution = [
  { name: "A tiempo", value: 24 },
  { name: "Tarde", value: 5 },
  { name: "Pendientes", value: 8 },
  { name: "Vencidos", value: 3 },
];

const entityRisk = [
  { entidad: "SUI", vencidos: 2, riesgo: 4 },
  { entidad: "Superservicios", vencidos: 1, riesgo: 3 },
  { entidad: "ANH", vencidos: 0, riesgo: 1 },
];

const STATUS_COLORS = ["#16a34a", "#f59e0b", "#0f172a", "#dc2626"];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard
          title="% Cumplimiento a tiempo"
          value="92%"
          subtitle="+4 pts vs mes anterior"
          status="Positivo"
        />
        <KpiCard
          title="Reportes vencidos"
          value="3"
          subtitle="2 críticos, 1 moderado"
          variant="danger"
        />
        <KpiCard
          title="Reportes este mes"
          value="27"
          subtitle="18 enviados, 6 en curso"
          variant="neutral"
        />
        <KpiCard
          title="Entidades con riesgo"
          value="2"
          subtitle="SUI, Superservicios"
          variant="warning"
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
          <div className="mt-4 h-64">
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={0}
              minHeight={0}
            >
              <LineChart data={complianceTrend} margin={{ left: -24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis
                  unit="%"
                  domain={[80, 100]}
                  tick={{ fontSize: 11 }}
                />
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
          </div>
        </div>

        {/* Distribución de estados */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col">
          <HeaderCard
            title="Estado de los reportes"
            subtitle="Distribución actual del portafolio"
          />
          <div className="mt-2 flex-1 flex flex-col">
            <div className="h-48">
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
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
              <MiniMetric
                label="Nivel de servicio"
                value="94%"
                desc="Meta 90%"
              />
              <MiniMetric
                label="Backlog operativo"
                value="11"
                desc="Pendientes + vencidos"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lower row: tabla + riesgo por entidad + actividad */}
      <div className="grid grid-cols-1 2xl:grid-cols-3 gap-4">
        {/* Próximos vencimientos */}
        <div className="2xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <HeaderCard
              title="Próximos vencimientos"
              subtitle="Obligaciones que vencen en los próximos 15 días"
            />
            <button className="text-[11px] px-2.5 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50">
              Ver calendario
            </button>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="border-y border-slate-200 bg-slate-50/60 text-slate-500">
              <tr>
                <th className="py-2 pl-2 font-medium">Reporte</th>
                <th className="py-2 font-medium">Entidad</th>
                <th className="py-2 font-medium">Responsable</th>
                <th className="py-2 font-medium">Vence</th>
                <th className="py-2 text-center font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <ReportRow
                name="SUI - Información Comercial Mensual"
                entity="SUI"
                owner="Coordinación Comercial"
                due="10/12/2025"
                status="En proceso"
                statusTone="warning"
              />
              <ReportRow
                name="Superservicios - Indicadores de Calidad"
                entity="Superservicios"
                owner="Calidad del Servicio"
                due="12/12/2025"
                status="Pendiente"
                statusTone="danger"
              />
              <ReportRow
                name="SUI - Información Operativa Trimestral"
                entity="SUI"
                owner="Operaciones"
                due="15/12/2025"
                status="En elaboración"
                statusTone="info"
              />
              <ReportRow
                name="ANH - Balance de gas natural"
                entity="ANH"
                owner="Planeación"
                due="18/12/2025"
                status="En revisión interna"
                statusTone="info"
              />
            </tbody>
          </table>
        </div>

        {/* Riesgo por entidad + actividad reciente */}
        <div className="space-y-4">
          {/* Riesgo por entidad */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
            <HeaderCard
              title="Riesgo por entidad"
              subtitle="Vencidos y nivel de riesgo relativo"
            />
            <div className="mt-4 h-40">
              <ResponsiveContainer
                width="100%"
                height="100%"
                minWidth={0}
                minHeight={0}
              >
                <BarChart data={entityRisk} barSize={16}>
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
                  <Bar dataKey="riesgo" name="Riesgo" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Actividad reciente */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
            <HeaderCard
              title="Actividad reciente"
              subtitle="Últimos movimientos de reportes"
            />
            <ul className="mt-3 space-y-3 text-[11px]">
              <TimelineItem
                time="Hace 15 min"
                title="SUI - Información Comercial Mensual"
                detail="Se envió borrador a aprobación de Gerencia Comercial."
                badge="En aprobación"
              />
              <TimelineItem
                time="Hace 1 h"
                title="Superservicios - Indicadores de Calidad"
                detail="Se cargó archivo base de indicadores al sistema."
                badge="Carga inicial"
              />
              <TimelineItem
                time="Ayer"
                title="ANH - Balance de gas natural"
                detail="Se registró como 'En elaboración' por Planeación."
                badge="Nuevo reporte"
              />
            </ul>
            <button className="mt-3 w-full text-[11px] py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50">
              Ver todo el historial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Components auxiliares */

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

function ReportRow({ name, entity, owner, due, status, statusTone }) {
  const statusColors = {
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-sky-100 text-sky-800",
    success: "bg-emerald-100 text-emerald-800",
  };

  return (
    <tr className="text-slate-700 hover:bg-slate-50/80 transition">
      <td className="py-2.5 pl-2 pr-2">
        <p className="font-medium text-[11px]">{name}</p>
        <p className="text-[11px] text-slate-500">
          Frecuencia: <span className="font-medium">Mensual</span>
        </p>
      </td>
      <td className="py-2.5 pr-2 text-[11px] text-slate-600">{entity}</td>
      <td className="py-2.5 pr-2 text-[11px] text-slate-600">{owner}</td>
      <td className="py-2.5 pr-2 text-[11px] text-slate-600">{due}</td>
      <td className="py-2.5 pr-2">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium ${
            statusColors[statusTone] || statusColors.info
          }`}
        >
          {status}
        </span>
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
          <p className="text-[11px] font-semibold text-slate-800">
            {title}
          </p>
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
