// src/pages/Settings.jsx
import React, { useEffect, useState } from "react";

const API_BASE = "/api/settings";

const DEFAULT_CONFIG = {
  emailNotifications: false,
  requireApproval: false,
  complianceTarget: 0,
};

export default function Settings() {
  const [config, setConfig] = useState({
    ...DEFAULT_CONFIG,
    complianceTarget: String(DEFAULT_CONFIG.complianceTarget),
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchSettings() {
      try {
        setLoading(true);
        setError("");
        setSuccess("");

        const res = await fetch(API_BASE);

        if (!res.ok) {
          console.error("Error HTTP en /api/settings:", res.status);
          if (!cancelled) {
            setConfig({
              ...DEFAULT_CONFIG,
              complianceTarget: String(DEFAULT_CONFIG.complianceTarget),
            });
            setError(
              "No se pudo cargar la configuración del servidor. Usando valores por defecto."
            );
          }
          return;
        }

        const data = await res.json();
        const cfg = data.configJson || {};

        if (!cancelled) {
          const complianceTarget =
            typeof cfg.complianceTarget === "number"
              ? String(cfg.complianceTarget)
              : String(DEFAULT_CONFIG.complianceTarget);

          setConfig({
            emailNotifications:
              typeof cfg.emailNotifications === "boolean"
                ? cfg.emailNotifications
                : DEFAULT_CONFIG.emailNotifications,
            requireApproval:
              typeof cfg.requireApproval === "boolean"
                ? cfg.requireApproval
                : DEFAULT_CONFIG.requireApproval,
            complianceTarget,
          });
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setConfig({
            ...DEFAULT_CONFIG,
            complianceTarget: String(DEFAULT_CONFIG.complianceTarget),
          });
          setError(
            "Error inesperado al cargar configuración. Usando valores por defecto."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = (key) => {
    setConfig((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const changeNumber = (key, value) => {
    // Permitimos vacío en UI, convertimos y validamos al guardar.
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // Normalizamos y validamos porcentaje antes de enviar
      let raw = config.complianceTarget;
      let num = Number(raw);

      if (!Number.isFinite(num)) {
        num = DEFAULT_CONFIG.complianceTarget;
      }

      // Clampeamos a [0, 100]
      num = Math.min(100, Math.max(0, num));

      const payload = {
        emailNotifications: !!config.emailNotifications,
        requireApproval: !!config.requireApproval,
        complianceTarget: num,
      };

      const res = await fetch(API_BASE, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configJson: payload }),
      });

      if (!res.ok) {
        const msg = `Error al guardar configuración (HTTP ${res.status}).`;
        console.error(msg);
        setError(msg);
        return;
      }

      // Actualizamos el estado local con el valor normalizado
      setConfig((prev) => ({
        ...prev,
        complianceTarget: String(num),
      }));

      setSuccess("Cambios guardados correctamente.");
    } catch (e) {
      console.error(e);
      setError(e.message || "Error al guardar configuración.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-xs text-slate-500">Cargando configuración...</div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-slate-900">
          Parámetros generales de la plataforma
        </h1>
        <p className="text-xs text-slate-500">
          Módulo de configuración reducido a lo esencial.
        </p>
      </div>

      {error && (
        <div className="mb-3 text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {success && !error && (
        <div className="mb-3 text-[11px] text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-md px-3 py-2">
          {success}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4 text-xs">
        <RowToggle
          label="Notificaciones por correo electrónico"
          desc="Enviar correos con recordatorios y vencimientos."
          value={config.emailNotifications}
          onChange={() => toggle("emailNotifications")}
        />

        <RowToggle
          label="Requerir flujo de aprobación"
          desc="Obligar aprobación antes de marcar reportes como enviados."
          value={config.requireApproval}
          onChange={() => toggle("requireApproval")}
        />

        <RowNumber
          label="Meta de cumplimiento a tiempo"
          desc="Porcentaje mínimo de reportes entregados puntualmente."
          suffix="%"
          value={config.complianceTarget}
          min={0}
          max={100}
          onChange={(v) => changeNumber("complianceTarget", v)}
        />

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-medium hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* Subcomponentes */

function RowToggle({ label, desc, value, onChange }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="font-semibold text-[11px] text-slate-800">{label}</p>
        {desc && <p className="text-[11px] text-slate-500">{desc}</p>}
      </div>
      <button
        type="button"
        onClick={onChange}
        role="switch"
        aria-checked={value}
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

function RowNumber({ label, desc, suffix, value, onChange, min, max }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="font-semibold text-[11px] text-slate-800">{label}</p>
        {desc && <p className="text-[11px] text-slate-500">{desc}</p>}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 text-xs border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-200"
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
