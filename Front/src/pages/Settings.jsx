// src/pages/Settings.jsx
import React, { useState } from "react";

const APPROVAL_OPTIONS = [
  "1 nivel: Responsable del reporte",
  "2 niveles: Responsable + Jefe inmediato",
  "3 niveles: Responsable + Jefe + Dirección",
];

export default function Settings() {
  // Estado central de configuración
  // TODO: reemplazar este estado inicial por valores del backend (useEffect / react-query / etc.)
  const [config, setConfig] = useState({
    notifications: {
      email: false,
      inApp: false,
      critical24h: false,
      weeklySummary: false,
    },
    approvals: {
      scheme: APPROVAL_OPTIONS[0],
      blockWithoutApproval: false,
      strongTrace: false,
    },
    compliance: {
      targetOnTime: 0,
      idealLeadDays: 0,
      maxOverdue: 0,
      earlyAlertDays: 0,
    },
    security: {
      mfaAdmin: false,
      logChanges: false,
      exportAudit: false,
    },
  });

  // TODO: poblar este campo desde backend (último cambio, usuario que guardó, etc.)
  const [lastSavedBy, setLastSavedBy] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedFlag, setSavedFlag] = useState(false);

  // Derivados para tarjetas de resumen (100% basados en config actual)
  const summary = {
    alertLevel: config.notifications.critical24h ? "Alto" : "Medio",
    alertHelper: config.notifications.critical24h
      ? "Alertas críticas activas a 24h de vencimiento."
      : "Alertas solo informativas, sin disparo crítico a 24h.",
    target: `${config.compliance.targetOnTime}%`,
    backlogLabel:
      Number(config.compliance.maxOverdue) === 0
        ? "0 vencidos"
        : `${config.compliance.maxOverdue} vencidos`,
    backlogHelper:
      Number(config.compliance.maxOverdue) === 0
        ? "No se permiten vencimientos abiertos."
        : "Se permite un backlog acotado de vencidos.",
  };

  const handleToggle = (path) => {
    setConfig((prev) => {
      const draft = structuredClone(prev);
      let ref = draft;
      for (let i = 0; i < path.length - 1; i++) {
        ref = ref[path[i]];
      }
      const key = path[path.length - 1];
      ref[key] = !ref[key];
      return draft;
    });
    setSavedFlag(false);
  };

  const handleRadioChange = (value) => {
    setConfig((prev) => ({
      ...prev,
      approvals: {
        ...prev.approvals,
        scheme: value,
      },
    }));
    setSavedFlag(false);
  };

  const handleParamChange = (field, value) => {
    setConfig((prev) => ({
      ...prev,
      compliance: {
        ...prev.compliance,
        [field]: value === "" ? "" : Number(value),
      },
    }));
    setSavedFlag(false);
  };

  const handleSave = async () => {
    // TODO: aquí va la llamada real al backend (PUT /settings, por ejemplo)
    setSaving(true);
    try {
      const now = new Date();
      const label = now.toLocaleString("es-CO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      // En un escenario real, este valor debería venir de la respuesta del backend
      setLastSavedBy(label);
      setSavedFlag(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Resumen ejecutivo de configuración (dinámico) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          label="Nivel de alertamiento"
          value={summary.alertLevel}
          helper={summary.alertHelper}
        />
        <SummaryCard
          label="Meta de cumplimiento"
          value={summary.target}
          helper="Objetivo mínimo para reportes a tiempo."
        />
        <SummaryCard
          label="Backlog tolerado"
          value={summary.backlogLabel}
          helper={summary.backlogHelper}
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
                value={config.notifications.email}
                onChange={() => handleToggle(["notifications", "email"])}
              />
              <ToggleRow
                label="Recordatorios dentro del sistema"
                desc="Bandeja de notificaciones con seguimiento de acciones pendientes."
                value={config.notifications.inApp}
                onChange={() => handleToggle(["notifications", "inApp"])}
              />
              <ToggleRow
                label="Alertas críticas (24 horas)"
                desc="Disparo inmediato cuando un reporte entra en zona roja de vencimiento."
                value={config.notifications.critical24h}
                onChange={() => handleToggle(["notifications", "critical24h"])}
              />
              <ToggleRow
                label="Resumen semanal a directivos"
                desc="Correo ejecutivo con KPIs de cumplimiento y riesgos por entidad."
                value={config.notifications.weeklySummary}
                onChange={() =>
                  handleToggle(["notifications", "weeklySummary"])
                }
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
                options={APPROVAL_OPTIONS}
                value={config.approvals.scheme}
                onChange={handleRadioChange}
              />
              <Divider />
              <ToggleRow
                label="Bloquear envío sin aprobación"
                desc="No se permite marcar como enviado si no está aprobado en todos los niveles definidos."
                value={config.approvals.blockWithoutApproval}
                onChange={() =>
                  handleToggle(["approvals", "blockWithoutApproval"])
                }
              />
              <ToggleRow
                label="Trazabilidad reforzada"
                desc="Registrar quién aprueba, cuándo y desde qué canal."
                value={config.approvals.strongTrace}
                onChange={() => handleToggle(["approvals", "strongTrace"])}
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
                value={config.compliance.targetOnTime}
                suffix="%"
                onChange={(v) => handleParamChange("targetOnTime", v)}
              />
              <ParamRow
                label="Días de antelación ideal para envío"
                value={config.compliance.idealLeadDays}
                suffix="días"
                onChange={(v) => handleParamChange("idealLeadDays", v)}
              />
              <ParamRow
                label="Máximo de reportes vencidos aceptables"
                value={config.compliance.maxOverdue}
                suffix="reportes"
                onChange={(v) => handleParamChange("maxOverdue", v)}
              />
              <ParamRow
                label="Umbral de alerta temprana"
                value={config.compliance.earlyAlertDays}
                suffix="días antes del vencimiento"
                onChange={(v) => handleParamChange("earlyAlertDays", v)}
              />
            </div>
            <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500">
              <span>
                Estos parámetros impactan directamente los KPIs del dashboard.
              </span>
              <div className="flex items-center gap-2">
                {savedFlag && (
                  <span className="text-emerald-600 text-[11px]">
                    Cambios guardados ✔
                  </span>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-medium hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
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
                value={config.security.mfaAdmin}
                onChange={() => handleToggle(["security", "mfaAdmin"])}
              />
              <ToggleRow
                label="Registrar cambios de configuración"
                desc="Guardar histórico de modificaciones en parámetros críticos."
                value={config.security.logChanges}
                onChange={() => handleToggle(["security", "logChanges"])}
              />
              <ToggleRow
                label="Exportar bitácora de auditoría"
                desc="Permitir descarga periódica de logs para revisión externa."
                value={config.security.exportAudit}
                onChange={() => handleToggle(["security", "exportAudit"])}
              />
            </div>
            <Divider />
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Última modificación de configuración:</span>
              <span className="font-medium text-slate-700">
                {lastSavedBy || "Sin registro aún"}
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

function ToggleRow({ label, desc, value, onChange }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="max-w-xs">
        <p className="font-semibold text-[11px] text-slate-800">{label}</p>
        {desc && <p className="text-[11px] text-slate-500">{desc}</p>}
      </div>
      <button
        type="button"
        onClick={onChange}
        className={[
          "relative inline-flex h-5 w-10 items-center rounded-full border transition-colors",
          value
            ? "bg-emerald-500 border-emerald-500"
            : "bg-slate-200 border-slate-300",
        ].join(" ")}
      >
        <span
          className={[
            "h-4 w-4 rounded-full bg-white shadow transform transition-transform",
            value ? "translate-x-5" : "translate-x-1",
          ].join(" ")}
        />
      </button>
    </div>
  );
}

function ParamRow({ label, value, suffix, onChange }) {
  return (
    <div className="flex items-center justify_between gap-3">
      <p className="text-[11px] text-slate-700">{label}</p>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
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

function RadioRow({ label, options, value, onChange }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold text-slate-800">{label}</p>
      <div className="space-y-1.5">
        {options.map((opt) => {
          const isActive = opt === value;
          return (
            <label
              key={opt}
              className="flex items-center gap-2 text-[11px] text-slate-700 cursor-pointer"
              onClick={() => onChange(opt)}
            >
              <span
                className={[
                  "inline-flex h-3 w-3 items-center justify-center rounded-full border",
                  isActive
                    ? "border-slate-900 bg-slate-900"
                    : "border-slate-300 bg-white",
                ].join(" ")}
              >
                {isActive && (
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
