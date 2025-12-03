// src/pages/Entities.jsx
import React, { useMemo, useState, useEffect } from "react";

// Inicial: sin datos quemados. Se llenará con backend o localStorage.
const INITIAL_ENTITIES = [];

// util simple para mostrar las fechas ISO
function formatDateTime(isoString) {
  if (!isoString) return "—";
  const d = new Date(isoString);
  if (isNaN(d)) return "—";

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");

  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}

export default function Entities() {
  const [entities, setEntities] = useState(() => {
    if (typeof window === "undefined") return INITIAL_ENTITIES;
    try {
      const raw = localStorage.getItem("entities");
      return raw ? JSON.parse(raw) : INITIAL_ENTITIES;
    } catch {
      return INITIAL_ENTITIES;
    }
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    code: "",
    name: "",
    website: "",
    legalBase: "",
    status: "Activa",
  });

  // Persistencia local (puedes reemplazar esto por llamadas a tu API)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("entities", JSON.stringify(entities));
    } catch {
      // ignore
    }
  }, [entities]);

  // Métricas de cabecera
  const metrics = useMemo(() => {
    const total = entities.length;
    const active = entities.filter((e) => e.status === "Activa").length;
    const inactive = entities.filter((e) => e.status === "Inactiva").length;
    return { total, active, inactive };
  }, [entities]);

  // Filtros
  const filteredEntities = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entities.filter((e) => {
      const matchesSearch =
        q === "" ||
        e.name.toLowerCase().includes(q) ||
        e.code.toLowerCase().includes(q) ||
        (e.website || "").toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "Todos" ? true : e.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [entities, search, statusFilter]);

  const resetForm = () => {
    setForm({
      code: "",
      name: "",
      website: "",
      legalBase: "",
      status: "Activa",
    });
    setEditingId(null);
  };

  const handleOpenNew = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (entity) => {
    setForm({
      code: entity.code || "",
      name: entity.name || "",
      website: entity.website || "",
      legalBase: entity.legalBase || "",
      status: entity.status || "Activa",
    });
    setEditingId(entity.id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (
      !window.confirm(
        "¿Eliminar esta entidad? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }
    setEntities((prev) => prev.filter((e) => e.id !== id));
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (!form.code.trim() || !form.name.trim()) {
      alert("ID de entidad y nombre son obligatorios.");
      return;
    }

    // Validación simple de URL (opcional)
    if (form.website.trim()) {
      try {
        // eslint-disable-next-line no-new
        new URL(
          form.website.startsWith("http")
            ? form.website
            : `https://${form.website}`
        );
      } catch {
        alert("La URL de la página web no es válida.");
        return;
      }
    }

    const timestamp = new Date().toISOString();

    if (editingId) {
      setEntities((prev) =>
        prev.map((e) =>
          e.id === editingId
            ? {
                ...e,
                ...form,
                updatedAt: timestamp,
              }
            : e
        )
      );
    } else {
      // evitar códigos duplicados localmente
      const exists = entities.some(
        (e) => e.code.toLowerCase() === form.code.trim().toLowerCase()
      );
      if (exists) {
        alert("Ya existe una entidad con ese ID. Usa otro identificador.");
        return;
      }

      const newEntity = {
        id: Date.now(), // en backend será el id real
        code: form.code.trim(),
        name: form.name.trim(),
        website: form.website.trim(),
        legalBase: form.legalBase.trim(),
        status: form.status,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      setEntities((prev) => [...prev, newEntity]);
    }

    setShowModal(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Resumen ejecutivo de entidades */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="Entidades registradas"
          value={metrics.total}
          helper="Total de entidades de control disponibles."
        />
        <MetricCard
          label="Activas"
          value={metrics.active}
          tone="success"
          helper="Entidades habilitadas para asignar reportes."
        />
        <MetricCard
          label="Inactivas"
          value={metrics.inactive}
          tone="warning"
          helper="No se muestran en nuevos reportes, pero conservan histórico."
        />
      </div>

      {/* Filtros + acciones */}
      <div className="bg-white rounded-2xl border border-slate-200 px-4 py-4 md:px-5 md:py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
              Estado
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="Todos">Todos</option>
              <option value="Activa">Activa</option>
              <option value="Inactiva">Inactiva</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre, ID o web..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-72 rounded-full border border-slate-200 bg-slate-50 px-8 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
            <span className="pointer-events-none absolute left-2 top-1.5 text-slate-400 text-sm">
              🔍
            </span>
          </div>
          <button
            onClick={handleOpenNew}
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 h-9 text-xs font-medium text-white hover:bg-slate-800"
          >
            + Nueva entidad
          </button>
        </div>
      </div>

      {/* Tabla de entidades */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Entidades de control
            </h2>
            <p className="text-[11px] text-slate-500">
              Catálogo centralizado de entidades para asignación de reportes.
            </p>
          </div>
          <span className="text-[11px] text-slate-500">
            {filteredEntities.length} registro(s) visible(s)
          </span>
        </div>

        <table className="w-full text-xs text-left">
          <thead className="border-b border-slate-200 bg-slate-50/60 text-slate-500">
            <tr>
              <th className="py-2 pl-4 font-medium">ID Entidad</th>
              <th className="py-2 font-medium">Nombre</th>
              <th className="py-2 font-medium">Página web</th>
              <th className="py-2 font-medium">Base legal</th>
              <th className="py-2 font-medium">Creado</th>
              <th className="py-2 font-medium">Actualizado</th>
              <th className="py-2 font-medium">Estado</th>
              <th className="py-2 pr-4 text-center font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredEntities.map((e) => (
              <tr key={e.id} className="text-slate-700 hover:bg-slate-50/70">
                <td className="py-2.5 pl-4 pr-2 text-[11px] font-medium text-slate-900">
                  {e.code}
                </td>
                <td className="py-2.5 pr-2 text-[11px]">{e.name}</td>
                <td className="py-2.5 pr-2 text-[11px] text-sky-600">
                  {e.website ? (
                    <a
                      href={
                        e.website.startsWith("http")
                          ? e.website
                          : `https://${e.website}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      {e.website}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="py-2.5 pr-2 text-[11px] text-slate-500 max-w-xs truncate">
                  {e.legalBase || "—"}
                </td>
                <td className="py-2.5 pr-2 text-[11px] text-slate-500">
                  {formatDateTime(e.createdAt)}
                </td>
                <td className="py-2.5 pr-2 text-[11px] text-slate-500">
                  {formatDateTime(e.updatedAt)}
                </td>
                <td className="py-2.5 pr-2 text-[11px]">
                  <StatusPill status={e.status} />
                </td>
                <td className="py-2.5 pr-4 text-center">
                  <div className="inline-flex gap-1">
                    <button
                      onClick={() => handleEdit(e)}
                      className="px-2 py-1 rounded-lg border border-slate-200 text-[10px] hover:bg-slate-50"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(e.id)}
                      className="px-2 py-1 rounded-lg border border-slate-200 text-[10px] hover:bg-slate-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredEntities.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="py-6 text-center text-[11px] text-slate-500"
                >
                  No hay entidades registradas o no coinciden con los filtros.
                  Cuando conectes el backend, este listado se llenará con las
                  entidades oficiales (SUI, Superservicios, ANH, etc.).
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal crear / editar entidad */}
      {showModal && (
        <EntityModal
          form={form}
          onChange={handleFormChange}
          onClose={() => {
            setShowModal(false);
            resetForm();
          }}
          onSave={handleSave}
          isEditing={!!editingId}
        />
      )}
    </div>
  );
}

/* ---------- Components auxiliares ---------- */

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

function StatusPill({ status }) {
  const map = {
    Activa: "bg-emerald-100 text-emerald-800",
    Inactiva: "bg-slate-200 text-slate-700",
  };
  const cls = map[status] || "bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium ${cls}`}
    >
      {status}
    </span>
  );
}

function EntityModal({ form, onChange, onClose, onSave, isEditing }) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onSubmit={onSave}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 p-5 space-y-4 text-xs"
      >
        <h3 className="text-sm font-semibold text-slate-900">
          {isEditing ? "Editar entidad" : "Nueva entidad"}
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-slate-600">ID Entidad *</span>
            <input
              type="text"
              value={form.code}
              onChange={(e) => onChange("code", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="Ej: SUI, SSPEL, ANH"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-slate-600">Estado</span>
            <select
              value={form.status}
              onChange={(e) => onChange("status", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="Activa">Activa</option>
              <option value="Inactiva">Inactiva</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 col-span-2">
            <span className="text-[11px] text-slate-600">Nombre *</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="Nombre completo de la entidad"
            />
          </label>

          <label className="flex flex-col gap-1 col-span-2">
            <span className="text-[11px] text-slate-600">Página web</span>
            <input
              type="text"
              value={form.website}
              onChange={(e) => onChange("website", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="Ej: www.entidad.gov.co"
            />
          </label>

          <label className="flex flex-col gap-1 col-span-2">
            <span className="text-[11px] text-slate-600">Base legal</span>
            <textarea
              value={form.legalBase}
              onChange={(e) => onChange("legalBase", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-200 h-20"
              placeholder="Normas o resoluciones principales asociadas a la entidad."
            />
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-slate-900 text-[11px] font-medium text-white hover:bg-slate-800"
          >
            {isEditing ? "Guardar cambios" : "Crear entidad"}
          </button>
        </div>
      </form>
    </div>
  );
}
