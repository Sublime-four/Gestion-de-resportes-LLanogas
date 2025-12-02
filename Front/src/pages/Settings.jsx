// src/pages/Settings.jsx
import React from "react";

export default function Settings() {
  return (
    <div className="space-y-6">
      {/* Resumen ejecutivo de configuración */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          label="Nivel de alertamiento"
          value="Alto"
          helper="Alertas críticas activas a 24h de vencimiento."
        />
        <SummaryCard
          label="Meta de cumplimiento"
          value="90%"
          helper="Objetivo mínimo para reportes a tiempo."
        />
        <SummaryCard
          label="Backlog tolerado"
          value="0 vencidos"
          helper="No se permiten vencimientos abiertos."
        />
      </div>

      {/* Paneles principales */}
      <div className="grid lg:grid-cols-[1.2fr,1.1fr] gap-4">
        {/* Columna izquierda */}
        <div className="space-y-4">
          {/* Notificaciones */}
          <SectionCard
            title="Notificaciones"
            subtitle="Define cómo y cuándo se envían alertas de vencimientos a los responsables."
          >
            <div className="space-y-4 text-xs">
              <ToggleRow
                label="Alertas por correo electrónico"
                desc="Resumen diario con vencimientos próximos, atrasos y criticidad por entidad."
                defaultOn
              />
              <ToggleRow
                label="Recordatorios dentro del sistema"
                desc="Bandeja de notificaciones con seguimiento de acciones pendientes."
                defaultOn
              />
              <ToggleRow
                label="Alertas críticas (24 horas)"
                desc="Disparo inmediato cuando un reporte entra en zona roja de vencimiento."
                defaultOn
              />
              <ToggleRow
                label="Resumen semanal a directivos"
                desc="Correo ejecutivo con KPIs de cumplimiento y riesgos por entidad."
              />
            </div>
          </SectionCard>

          {/* Flujo de aprobación */}
          <SectionCard
            title="Flujos de aprobación"
            subtitle="Controla cómo se aprueban y cierran los reportes regulatorios."
          >
            <div className="space-y-3 text-xs">
              <RadioRow
                label="Esquema de aprobación"
                options={[
                  "1 nivel: Responsable del reporte",
                  "2 niveles: Responsable + Jefe inmediato",
                  "3 niveles: Responsable + Jefe + Dirección",
                ]}
                defaultValue="2 niveles: Responsable + Jefe inmediato"
              />
              <Divider />
              <ToggleRow
                label="Bloquear envío sin aprobación"
                desc="No se permite marcar como enviado si no está aprobado en todos los niveles definidos."
                defaultOn
              />
              <ToggleRow
                label="Trazabilidad reforzada"
                desc="Registrar quién aprueba, cuándo y desde qué canal."
                defaultOn
              />
            </div>
          </SectionCard>
        </div>

        {/* Columna derecha */}
        <div className="space-y-4">
          {/* Parámetros de cumplimiento */}
          <SectionCard
            title="Parámetros de cumplimiento"
            subtitle="Umbrales que alimentan los indicadores del dashboard de cumplimiento."
          >
            <div className="space-y-3 text-xs">
              <ParamRow
                label="Meta de cumplimiento a tiempo"
                defaultValue="90"
                suffix="%"
              />
              <ParamRow
                label="Días de antelación ideal para envío"
                defaultValue="5"
                suffix="días"
              />
              <ParamRow
                label="Máximo de reportes vencidos aceptables"
                defaultValue="0"
                suffix="reportes"
              />
              <ParamRow
                label="Umbral de alerta temprana"
                defaultValue="3"
                suffix="días antes del vencimiento"
              />
            </div>
            <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500">
              <span>
                Estos parámetros impactan directamente los KPIs del dashboard.
              </span>
              <button className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-medium hover:bg-slate-800">
                Guardar cambios
              </button>
            </div>
          </SectionCard>

          {/* Seguridad y auditoría */}
          <SectionCard
            title="Seguridad y auditoría"
            subtitle="Control de acceso y registro de cambios sobre la configuración."
          >
            <div className="space-y-3 text-xs">
              <ToggleRow
                label="Requerir doble autenticación"
                desc="Solicitar un segundo factor para usuarios con rol de Administrador."
              />
              <ToggleRow
                label="Registrar cambios de configuración"
                desc="Guardar histórico de modificaciones en parámetros críticos."
                defaultOn
              />
              <ToggleRow
                label="Exportar bitácora de auditoría"
                desc="Permitir descarga periódica de logs para revisión externa."
              />
            </div>
            <Divider />
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Última modificación de configuración:</span>
              <span className="font-medium text-slate-700">
                02/12/2025 · 09:34 · Yohan Piñarte
              </span>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

/* Components */

function SectionCard({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {subtitle && (
          <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function SummaryCard({ label, value, helper }) {
  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white p-4 text-xs shadow-sm">
      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 mb-1">
        {label}
      </p>
      <p className="text-xl font-semibold text-slate-900 mb-0.5">{value}</p>
      {helper && <p className="text-[11px] text-slate-500">{helper}</p>}
    </div>
  );
}

function ToggleRow({ label, desc, defaultOn }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="max-w-xs">
        <p className="font-semibold text-[11px] text-slate-800">{label}</p>
        {desc && <p className="text-[11px] text-slate-500">{desc}</p>}
      </div>
      <button
        type="button"
        className={[
          "relative inline-flex h-5 w-10 items-center rounded-full border transition-colors",
          defaultOn
            ? "bg-emerald-500 border-emerald-500"
            : "bg-slate-200 border-slate-300",
        ].join(" ")}
      >
        <span
          className={[
            "h-4 w-4 rounded-full bg-white shadow transform transition-transform",
            defaultOn ? "translate-x-5" : "translate-x-1",
          ].join(" ")}
        />
      </button>
    </div>
  );
}

function ParamRow({ label, defaultValue, suffix }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-[11px] text-slate-700">{label}</p>
      <div className="flex items-center gap-2">
        <input
          type="number"
          defaultValue={defaultValue}
          className="w-20 text-xs border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-200"
        />
        {suffix && (
          <span className="text-[11px] text-slate-500 whitespace-nowrap">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function RadioRow({ label, options, defaultValue }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold text-slate-800">{label}</p>
      <div className="space-y-1.5">
        {options.map((opt) => {
          const isDefault = opt === defaultValue;
          return (
            <label
              key={opt}
              className="flex items-center gap-2 text-[11px] text-slate-700 cursor-pointer"
            >
              <span
                className={[
                  "inline-flex h-3 w-3 items-center justify-center rounded-full border",
                  isDefault
                    ? "border-slate-900 bg-slate-900"
                    : "border-slate-300 bg-white",
                ].join(" ")}
              >
                {isDefault && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </span>
              <span>{opt}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="my-3 h-px bg-slate-100" />;
}
