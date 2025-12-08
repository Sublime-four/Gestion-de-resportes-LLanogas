// src/pages/Entities.jsx
import React, { useMemo, useState, useEffect } from "react";

const REPORTS_API = "/api/reports";

const INITIAL_ENTITIES = [];
const PAGE_SIZE = 10; // límite de 10 filas

// ===== helpers de fechas =====
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

function parseDateString(dateStr) {
  if (!dateStr) return null;
  const iso = new Date(dateStr);
  if (!isNaN(iso)) return iso;
  const parts = String(dateStr).split("/");
  if (parts.length === 3) {
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const y = parseInt(parts[2], 10);
    const dd = new Date(y, m, d);
    if (!isNaN(dd)) return dd;
  }
  return null;
}

// meses de diferencia entre dueDate y hoy, sólo si está vencido
function monthsOverdue(dueDate) {
  if (!dueDate) return 0;
  const today = new Date();
  const todayMid = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const dueMid = new Date(
    dueDate.getFullYear(),
    dueDate.getMonth(),
    dueDate.getDate()
  );

  if (todayMid <= dueMid) return 0; // no está vencido

  const months =
    (todayMid.getFullYear() - dueMid.getFullYear()) * 12 +
    (todayMid.getMonth() - dueMid.getMonth());

  return months;
}

// ===== regla de negocio: si vencido >= 2 meses -> Inactiva, resto Activa =====
function computeEntityStatus(entity) {
  if (entity.vencido !== undefined && entity.vencido !== null) {
    const v = String(entity.vencido).trim().toLowerCase();
    if (v === "2 meses" || v === "2 mes" || v === "2") return "Inactiva";
  }

  const meses =
    typeof entity.vencidoMeses === "number" ? entity.vencidoMeses : 0;
  return meses >= 2 ? "Inactiva" : "Activa";
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
  const [currentPage, setCurrentPage] = useState(1);

  // Cargar reportes y construir entidades derivadas
  useEffect(() => {
    const loadData = async () => {
      let reports = [];

      // 1) reports desde backend
      try {
        const resp = await fetch(REPORTS_API);
        if (resp.ok) {
          reports = await resp.json();
        } else {
          console.warn(
            "No se pudieron cargar reports desde backend, status:",
            resp.status
          );
        }
      } catch (err) {
        console.warn(
          "Error llamando a /api/reports, uso localStorage si existe",
          err
        );
      }

      // fallback reports localStorage
      if (!reports.length && typeof window !== "undefined") {
        try {
          const saved = localStorage.getItem("reportesCreados");
          if (saved) reports = JSON.parse(saved);
        } catch (e) {
          console.error("Error leyendo reportesCreados de localStorage", e);
        }
      }

      // 2) agrupar por entidad desde reports
      const map = new Map();

      reports.forEach((r) => {
        const rawCode = (r.entidadControl || r.entity || "").trim();
        if (!rawCode) return;

        const key = rawCode.toLowerCase();
        const baseLegal = r.baseLegal || r.marcoLegal || "";

        const dueStr =
          r.fechaLimiteEnvio || r.nextDue || r.due || null;
        const dueDate = parseDateString(dueStr);
        const mesesVencido = monthsOverdue(dueDate);

        const createdCandidate =
          parseDateString(r.fechaInicio) ||
          parseDateString(r.createdAt) ||
          null;
        const updatedCandidate =
          parseDateString(r.fechaLimiteEnvio) ||
          parseDateString(r.updatedAt) ||
          parseDateString(r.fechaInicio) ||
          null;

        if (!map.has(key)) {
          map.set(key, {
            id: rawCode,
            code: rawCode,
            name: rawCode,
            website: "",
            legalBase: baseLegal,
            createdAt: createdCandidate
              ? createdCandidate.toISOString()
              : null,
            updatedAt: updatedCandidate
              ? updatedCandidate.toISOString()
              : null,
            vencidoMeses: mesesVencido,
          });
        } else {
          const ent = map.get(key);

          if (baseLegal) {
            const merged = new Set(
              (ent.legalBase || "")
                .split(";")
                .map((s) => s.trim())
                .filter(Boolean)
            );
            merged.add(baseLegal);
            ent.legalBase = Array.from(merged).join("; ");
          }

          if (createdCandidate) {
            if (
              !ent.createdAt ||
              new Date(createdCandidate) < new Date(ent.createdAt)
            ) {
              ent.createdAt = createdCandidate.toISOString();
            }
          }

          if (updatedCandidate) {
            if (
              !ent.updatedAt ||
              new Date(updatedCandidate) > new Date(ent.updatedAt)
            ) {
              ent.updatedAt = updatedCandidate.toISOString();
            }
          }

          ent.vencidoMeses = Math.max(
            ent.vencidoMeses || 0,
            mesesVencido
          );

          map.set(key, ent);
        }
      });

      const entitiesFromReports = Array.from(map.values());
      setEntities(entitiesFromReports);

      try {
        localStorage.setItem("entities", JSON.stringify(entitiesFromReports));
      } catch (e) {
        console.error("No pude guardar entities en localStorage", e);
      }
    };

    loadData();
  }, []);

  // Persistencia local cada vez que cambian
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
    const active = entities.filter(
      (e) => computeEntityStatus(e) === "Activa"
    ).length;
    const inactive = entities.filter(
      (e) => computeEntityStatus(e) === "Inactiva"
    ).length;
    return { total, active, inactive };
  }, [entities]);

  // Filtros
  const filteredEntities = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entities.filter((e) => {
      const matchesSearch =
        q === "" ||
        (e.name || "").toLowerCase().includes(q) ||
        (e.code || "").toLowerCase().includes(q) ||
        (e.website || "").toLowerCase().includes(q);

      const status = computeEntityStatus(e);
      const matchesStatus =
        statusFilter === "Todos" ? true : status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [entities, search, statusFilter]);

  // paginación
  const totalPages = Math.max(
    1,
    Math.ceil(filteredEntities.length / PAGE_SIZE)
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [filteredEntities.length, totalPages, currentPage]);

  const paginatedEntities = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredEntities.slice(start, end);
  }, [filteredEntities, currentPage]);

  const startIndex =
    filteredEntities.length === 0
      ? 0
      : (currentPage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(
    currentPage * PAGE_SIZE,
    filteredEntities.length
  );

  return (
    <div className="space-y-6">
      {/* Resumen ejecutivo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="Entidades registradas"
          value={metrics.total}
          helper="Total de entidades de control con reportes."
        />
        <MetricCard
          label="Activas"
          value={metrics.active}
          tone="success"
          helper="Sin reportes vencidos ≥ 2 meses."
        />
        <MetricCard
          label="Inactivas"
          value={metrics.inactive}
          tone="warning"
          helper="Con al menos un reporte vencido ≥ 2 meses."
        />
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-slate-200 px-4 py-4 md:px-5 md:py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
              Estado (regla 2 meses)
            </span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
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
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 w-72 rounded-full border border-slate-200 bg-slate-50 px-8 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
            <span className="pointer-events-none absolute left-2 top-1.5 text-slate-400 text-sm">
              🔍
            </span>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Entidades de control
            </h2>
            <p className="text-[11px] text-slate-500">
              Catálogo centralizado por entidad, consolidado desde los
              reportes. Vista solo lectura.
            </p>
          </div>
          <span className="text-[11px] text-slate-500">
            {filteredEntities.length} registro(s) filtrado(s) | página{" "}
            {currentPage} de {totalPages}
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
              <th className="py-2 font-medium">
                Última modificación (reportes)
              </th>
              <th className="py-2 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedEntities.map((e) => {
              const computedStatus = computeEntityStatus(e);
              return (
                <tr
                  key={e.id || e.code}
                  className="text-slate-700 hover:bg-slate-50/70"
                >
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
                    <StatusPill status={computedStatus} />
                  </td>
                </tr>
              );
            })}

            {filteredEntities.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="py-6 text-center text-[11px] text-slate-500"
                >
                  No hay entidades registradas o no coinciden con los
                  filtros. Se construyen automáticamente a partir de los
                  reportes.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Controles de paginación */}
        {filteredEntities.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 text-[11px] text-slate-600">
            <span>
              Mostrando {startIndex}–{endIndex} de{" "}
              {filteredEntities.length} registro(s)
            </span>
            <div className="inline-flex items-center gap-2">
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.max(1, p - 1))
                }
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-full border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                ← Anterior
              </button>
              <span>
                Página {currentPage} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-full border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>
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
        <p className="text-xl font-semibold text-slate-900 mb-0.5">
          {value}
        </p>
        {helper && (
          <p className="text-[11px] text-slate-600 leading-snug">
            {helper}
          </p>
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
