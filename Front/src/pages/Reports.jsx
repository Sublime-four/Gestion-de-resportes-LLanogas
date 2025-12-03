// src/pages/Reports.jsx
import React, { useState, useRef, useEffect } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const reports = [];

// ------- Utilidades de fecha / criticidad -------

function parseDateString(dateStr) {
  if (!dateStr) return null;
  const iso = new Date(dateStr);
  if (!isNaN(iso)) return iso;

  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const y = parseInt(parts[2], 10);
    return new Date(y, m, d);
  }
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
  const step = freqMap[frecuencia] || 1;

  while (next <= today) {
    next = addMonthsSafe(next, step);
    if (next.getFullYear() > now.getFullYear() + 10) break;
  }
  return next;
}

function formatDate(d) {
  if (!d) return "-";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function monthsUntil(date) {
  if (!date) return null;
  const now = new Date();
  return (
    (date.getFullYear() - now.getFullYear()) * 12 +
    (date.getMonth() - now.getMonth())
  );
}

function criticidadFromMonths(months) {
  if (months === null || months === undefined) return "-";
  if (months <= 1) return "Crítica";
  if (months >= 2 && months <= 6) return "Alta";
  if (months >= 7 && months <= 10) return "Media";
  return "Baja";
}

// --------------- Componente principal ---------------

export default function Reports() {
  const [showModal, setShowModal] = useState(false);
  const [nuevoReporte, setNuevoReporte] = useState({
    idReporte: "",
    nombreReporte: "",
    entidadControl: "",
    baseLegal: "",
    fechaInicio: "",
    responsableElaboracionName: "",
    responsableElaboracionCC: "",
    responsableSupervisionName: "",
    responsableSupervisionCC: "",
    telefonoResponsable: "",
    correosNotificacion: "",
    frecuencia: "Mensual",
  });

  const [reportesCreados, setReportesCreados] = useState(() => {
    if (typeof window === "undefined") return [];
    const reportesGuardados = localStorage.getItem("reportesCreados");
    return reportesGuardados ? JSON.parse(reportesGuardados) : [];
  });

  const reportesRef = useRef(null);

  // Filas expandidas
  const [expandedIds, setExpandedIds] = useState([]);
  const toggleExpand = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Filtros / búsqueda
  const [searchQuery, setSearchQuery] = useState("");
  const searchLower = searchQuery.trim().toLowerCase();
  const [selectedEntity, setSelectedEntity] = useState("Todas");
  const [selectedFrequency, setSelectedFrequency] = useState("Todas");

  // Hoy normalizado
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Estado manual de cada reporte (Activo/Pendiente)
  const [statusMap, setStatusMap] = useState(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem("reportStatuses");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("reportStatuses", JSON.stringify(statusMap));
    } catch {
      // ignore
    }
  }, [statusMap]);

  const handleToggleStatus = (id) => {
    setStatusMap((prev) => {
      const current = prev && prev[id];
      const next = current === "Activo" ? "Pendiente" : "Activo";
      return { ...prev, [id]: next };
    });
  };

  // Datos derivados (con nextDue)
  const createdWithDue = reportesCreados.map((rep) => {
    const frecuencia = rep.frecuencia || "Mensual";
    const next = computeNextDue(rep.fechaInicio, frecuencia);
    return { ...rep, nextDue: next };
  });

  const staticWithDue = reports.map((r, idx) => {
    const parsed = parseDateString(r.due);
    const id = r.id || r.name || r.nombreReporte || `static_${idx}`;
    return { ...r, id, nextDue: parsed, source: "static" };
  });

  const combined = [...staticWithDue, ...createdWithDue].filter(
    (x) => x.nextDue != null
  );
  combined.sort((a, b) => a.nextDue - b.nextDue);
  const soonest = combined.length ? combined[0] : null;

  // Métricas
  const totalReports = combined.length;

  const countPending = combined.filter((r) => {
    const status = statusMap[r.id];
    if (status !== undefined) return status === "Pendiente";
    return r.nextDue && r.nextDue <= todayStart;
  }).length;

  const countActive = combined.filter((r) => {
    const status = statusMap[r.id];
    if (status !== undefined) return status === "Activo";
    return r.nextDue && r.nextDue > todayStart;
  }).length;

  const countOverdue = combined.filter((r) => {
    if (r.nextDue && r.nextDue < todayStart) {
      const status = statusMap[r.id];
      if (status === "Activo") return false;
      return true;
    }
    return false;
  }).length;

  const percentOnTime = totalReports
    ? Math.round((countActive / totalReports) * 100)
    : 0;

  // Lista filtrada para la tabla
  const combinedFiltered = combined.filter((x) => {
    const matchesSearch = Object.values(x)
      .join(" ")
      .toLowerCase()
      .includes(searchLower);

    const reportEntity = x.entity || x.entidadControl || "-";
    const matchesEntity =
      selectedEntity === "Todas" || reportEntity === selectedEntity;

    const reportFreq = x.freq || x.frecuencia || "-";
    const matchesFreq =
      selectedFrequency === "Todas" || reportFreq === selectedFrequency;

    return matchesSearch && matchesEntity && matchesFreq;
  });

  // Persistir reportes en localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("reportesCreados", JSON.stringify(reportesCreados));
  }, [reportesCreados]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoReporte((prev) => ({ ...prev, [name]: value }));
  };

  const handleAgregarReporte = () => {
    if (
      !nuevoReporte.idReporte.trim() ||
      !nuevoReporte.nombreReporte.trim() ||
      !nuevoReporte.fechaInicio
    ) {
      alert("Complete los campos obligatorios: ID, Nombre y Fecha de inicio.");
      return;
    }

    const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
    if (
      nuevoReporte.responsableElaboracionName &&
      !nameRegex.test(nuevoReporte.responsableElaboracionName)
    ) {
      alert(
        "El nombre del responsable de elaboración debe contener solo letras y espacios."
      );
      return;
    }
    if (
      nuevoReporte.responsableSupervisionName &&
      !nameRegex.test(nuevoReporte.responsableSupervisionName)
    ) {
      alert(
        "El nombre del responsable de supervisión debe contener solo letras y espacios."
      );
      return;
    }

    const ccRegex = /^\d*$/;
    if (
      nuevoReporte.responsableElaboracionCC &&
      !ccRegex.test(nuevoReporte.responsableElaboracionCC)
    ) {
      alert(
        "La cédula/CC del responsable de elaboración debe contener solo números."
      );
      return;
    }
    if (
      nuevoReporte.responsableSupervisionCC &&
      !ccRegex.test(nuevoReporte.responsableSupervisionCC)
    ) {
      alert(
        "La cédula/CC del responsable de supervisión debe contener solo números."
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (
      nuevoReporte.correosNotificacion &&
      nuevoReporte.correosNotificacion.trim()
    ) {
      const emails = nuevoReporte.correosNotificacion
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const invalid = emails.find((e) => !emailRegex.test(e));
      if (invalid) {
        alert(
          "La lista de correos contiene una dirección inválida: " + invalid
        );
        return;
      }
    }

    const newRep = {
      ...nuevoReporte,
      id: Date.now(),
      source: "created",
    };
    newRep.nextDue = computeNextDue(newRep.fechaInicio, newRep.frecuencia);

    setReportesCreados((prev) => [...prev, newRep]);

    setNuevoReporte({
      idReporte: "",
      nombreReporte: "",
      entidadControl: "",
      baseLegal: "",
      fechaInicio: "",
      responsableElaboracionName: "",
      responsableElaboracionCC: "",
      responsableSupervisionName: "",
      responsableSupervisionCC: "",
      telefonoResponsable: "",
      correosNotificacion: "",
      frecuencia: "Mensual",
    });
    setShowModal(false);
  };

  const handleEliminarReporte = (id) => {
    setReportesCreados((prev) => prev.filter((rep) => rep.id !== id));
  };

  const generatePDF = async (reportId) => {
    if (!reportId) return;

    const report = combined.find((r) => r.id === reportId);
    if (!report) return;

    const name = report.name || report.nombreReporte;
    const entity = report.entity || report.entidadControl || "-";
    const freq = report.freq || report.frecuencia || "-";
    const due =
      report.nextDue instanceof Date
        ? formatDate(report.nextDue)
        : report.nextDue
        ? formatDate(parseDateString(report.nextDue))
        : "-";
    const months = monthsUntil(report.nextDue);
    const criticidad = criticidadFromMonths(months);
    const responsableElab = report.responsableElaboracionName
      ? `${report.responsableElaboracionName} (${
          report.responsableElaboracionCC || "-"
        })`
      : "-";
    const responsableSup = report.responsableSupervisionName
      ? `${report.responsableSupervisionName} (${
          report.responsableSupervisionCC || "-"
        })`
      : "-";

    const container = document.createElement("div");
    container.style.padding = "20px";
    container.style.backgroundColor = "white";
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.width = "800px";
    container.style.fontFamily = "Arial, sans-serif";
    container.style.fontSize = "12px";

    container.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 24px; color: #1f2937;">Reporte Detallado</h1>
      </div>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr style="background-color: #f3f4f6;">
          <td style="border: 1px solid #d1d5db; padding: 12px; font-weight: bold; width: 40%;">Nombre del Reporte:</td>
          <td style="border: 1px solid #d1d5db; padding: 12px;">${name}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #d1d5db; padding: 12px; font-weight: bold;">Entidad de Control:</td>
          <td style="border: 1px solid #d1d5db; padding: 12px;">${entity}</td>
        </tr>
        <tr style="background-color: #f3f4f6;">
          <td style="border: 1px solid #d1d5db; padding: 12px; font-weight: bold;">Frecuencia:</td>
          <td style="border: 1px solid #d1d5db; padding: 12px;">${freq}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #d1d5db; padding: 12px; font-weight: bold;">Próximo Vencimiento:</td>
          <td style="border: 1px solid #d1d5db; padding: 12px;">${due}</td>
        </tr>
        <tr style="background-color: #f3f4f6;">
          <td style="border: 1px solid #d1d5db; padding: 12px; font-weight: bold;">Criticidad:</td>
          <td style="border: 1px solid #d1d5db; padding: 12px;">${criticidad}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #d1d5db; padding: 12px; font-weight: bold;">Responsable (Elaboración):</td>
          <td style="border: 1px solid #d1d5db; padding: 12px;">${responsableElab}</td>
        </tr>
        <tr style="background-color: #f3f4f6;">
          <td style="border: 1px solid #d1d5db; padding: 12px; font-weight: bold;">Responsable (Supervisión):</td>
          <td style="border: 1px solid #d1d5db; padding: 12px;">${responsableSup}</td>
        </tr>
        ${
          report.baseLegal
            ? `<tr>
          <td style="border: 1px solid #d1d5db; padding: 12px; font-weight: bold;">Base Legal:</td>
          <td style="border: 1px solid #d1d5db; padding: 12px;">${report.baseLegal}</td>
        </tr>`
            : ""
        }
        ${
          report.telefonoResponsable
            ? `<tr style="background-color: #f3f4f6;">
          <td style="border: 1px solid #d1d5db; padding: 12px; font-weight: bold;">Teléfono:</td>
          <td style="border: 1px solid #d1d5db; padding: 12px;">${report.telefonoResponsable}</td>
        </tr>`
            : ""
        }
        ${
          report.correosNotificacion
            ? `<tr>
          <td style="border: 1px solid #d1d5db; padding: 12px; font-weight: bold;">Correos de Notificación:</td>
          <td style="border: 1px solid #d1d5db; padding: 12px;">${report.correosNotificacion}</td>
        </tr>`
            : ""
        }
        ${
          report.fechaInicio
            ? `<tr style="background-color: #f3f4f6;">
          <td style="border: 1px solid #d1d5db; padding: 12px; font-weight: bold;">Fecha de Inicio:</td>
          <td style="border: 1px solid #d1d5db; padding: 12px;">${report.fechaInicio}</td>
        </tr>`
            : ""
        }
      </table>
    `;

    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save(`reporte_${name.replace(/\s+/g, "_")}.pdf`);
    } finally {
      document.body.removeChild(container);
    }
  };

  return (
    <div className="space-y-6">
      {/* Resumen ejecutivo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          label="Reportes activos"
          value={totalReports}
          helper="Portafolio total configurado."
        />
        <MetricCard
          label="Pendientes"
          value={countPending}
          tone="warning"
          helper="Reportes con vencimiento hoy o anteriores."
        />
        <MetricCard
          label="Vencidos"
          value={countOverdue}
          tone="danger"
          helper="Reportes cuyo vencimiento ya pasó."
        />
        <MetricCard
          label="% a tiempo (YTD)"
          value={`${percentOnTime}%`}
          tone="success"
          helper="Porcentaje de reportes a futuro (no vencidos)."
        />
      </div>

      {/* Filtros + vista */}
      <div className="bg-white rounded-2xl border border-slate-200 px-4 py-4 md:px-5 md:py-4 flex flex-col gap-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                Entidad
              </span>
              <select
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <option value="Todas">Todas</option>
                <option value="SUI">SUI</option>
                <option value="Superservicios">Superservicios</option>
                <option value="ANH">ANH</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                Frecuencia
              </span>
              <select
                value={selectedFrequency}
                onChange={(e) => setSelectedFrequency(e.target.value)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <option value="Todas">Todas</option>
                <option value="Mensual">Mensual</option>
                <option value="Trimestral">Trimestral</option>
                <option value="Semestral">Semestral</option>
                <option value="Anual">Anual</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar en reportes (ID, nombre, entidad, base legal, fechas...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-72 rounded-full border border-slate-200 bg-slate-50 px-8 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
              <span className="pointer-events-none absolute left-2 top-1.5 text-slate-400 text-sm">
                🔍
              </span>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 h-9 text-xs font-medium text-white hover:bg-slate-800"
            >
              + Nuevo reporte
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <div />
          <span className="text-slate-500 hidden md:inline">
            Vista de trabajo del portafolio regulatorio.
          </span>
        </div>
      </div>

      {/* Modal para nuevo reporte */}
      {showModal && (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    onClick={() => setShowModal(false)}        // click fuera = cerrar
  >
    <div
      className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto"
      onClick={(e) => e.stopPropagation()}     // click dentro NO cierra
    >
            <h2 className="text-lg font-bold mb-4">Crear Nuevo Reporte</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  ID Reporte *
                </label>
                <input
                  type="text"
                  name="idReporte"
                  value={nuevoReporte.idReporte}
                  onChange={handleInputChange}
                  placeholder="Ej: REP001"
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Nombre del Reporte *
                </label>
                <input
                  type="text"
                  name="nombreReporte"
                  value={nuevoReporte.nombreReporte}
                  onChange={handleInputChange}
                  placeholder="Ej: Información Comercial"
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Entidad de Control
                </label>
                <input
                  type="text"
                  name="entidadControl"
                  value={nuevoReporte.entidadControl}
                  onChange={handleInputChange}
                  placeholder="Ej: SUI, Superservicios, ANH"
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Base Legal
                </label>
                <textarea
                  name="baseLegal"
                  value={nuevoReporte.baseLegal}
                  onChange={handleInputChange}
                  placeholder="Normativas o leyes principales"
                  className="w-full border rounded px-3 py-2 text-sm h-16"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Responsable elaboración - Nombre
                </label>
                <input
                  type="text"
                  name="responsableElaboracionName"
                  value={nuevoReporte.responsableElaboracionName}
                  onChange={handleInputChange}
                  placeholder="Nombre completo"
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Responsable elaboración - CC
                </label>
                <input
                  type="text"
                  name="responsableElaboracionCC"
                  value={nuevoReporte.responsableElaboracionCC}
                  onChange={handleInputChange}
                  placeholder="Documento (solo números)"
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Responsable supervisión - Nombre
                </label>
                <input
                  type="text"
                  name="responsableSupervisionName"
                  value={nuevoReporte.responsableSupervisionName}
                  onChange={handleInputChange}
                  placeholder="Nombre completo"
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Responsable supervisión - CC
                </label>
                <input
                  type="text"
                  name="responsableSupervisionCC"
                  value={nuevoReporte.responsableSupervisionCC}
                  onChange={handleInputChange}
                  placeholder="Documento (solo números)"
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Teléfono del responsable
                </label>
                <input
                  type="tel"
                  name="telefonoResponsable"
                  value={nuevoReporte.telefonoResponsable}
                  onChange={handleInputChange}
                  placeholder="Ej: +57 300 0000000"
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Correos de Notificación
                </label>
                <textarea
                  name="correosNotificacion"
                  value={nuevoReporte.correosNotificacion}
                  onChange={handleInputChange}
                  placeholder="Lista de emails separada por comas"
                  className="w-full border rounded px-3 py-2 text-sm h-16"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Fecha de Inicio Vigencia
                </label>
                <input
                  type="date"
                  name="fechaInicio"
                  value={nuevoReporte.fechaInicio}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Frecuencia
                </label>
                <select
                  name="frecuencia"
                  value={nuevoReporte.frecuencia}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option>Mensual</option>
                  <option>Trimestral</option>
                  <option>Semestral</option>
                  <option>Anual</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border rounded text-sm font-medium hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAgregarReporte}
                className="flex-1 px-4 py-2 bg-slate-900 text-white rounded text-sm font-medium hover:bg-slate-800"
              >
                Agregar Reporte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de reportes */}
      <div
        className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
        ref={reportesRef}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Portafolio de reportes regulatorios
            </h3>
            <p className="text-[11px] text-slate-500">
              Gestión centralizada de vencimientos, responsables y criticidad
              por entidad.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 text-[11px] text-slate-500">
            <span className="hidden sm:inline">
              {combinedFiltered.length} registros encontrados
            </span>
            <LegendPills />
          </div>
        </div>

        <table className="w-full text-xs text-left">
          <thead className="border-b border-slate-200 bg-slate-50/60 text-slate-500">
            <tr>
              <th className="py-2 pl-4 font-medium">Reporte</th>
              <th className="py-2 font-medium">Entidad</th>
              <th className="py-2 font-medium">Frecuencia</th>
              <th className="py-2 font-medium">Responsable (Elaboración)</th>
              <th className="py-2 font-medium">Responsable (Supervisión)</th>
              <th className="py-2 font-medium">Próximo vencimiento</th>
              <th className="py-2 font-medium">Criticidad</th>
              <th className="py-2 font-medium">Estado</th>
              <th className="py-2 pr-4 text-center font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {combinedFiltered.map((r) => {
              const isSoonest =
                soonest &&
                ((soonest.id && r.id && soonest.id === r.id) ||
                  (soonest.name && r.name && soonest.name === r.name));

              const name = r.name || r.nombreReporte;
              const entity = r.entity || r.entidadControl || "-";
              const freq = r.freq || r.frecuencia || "-";
              const due =
                r.nextDue instanceof Date
                  ? formatDate(r.nextDue)
                  : r.nextDue
                  ? formatDate(parseDateString(r.nextDue))
                  : "-";
              const months = monthsUntil(r.nextDue);
              const criticidad = criticidadFromMonths(months);
              const responsableElab = r.responsableElaboracionName
                ? `${r.responsableElaboracionName} (${
                    r.responsableElaboracionCC || "-"
                  })`
                : "-";
              const responsableSup = r.responsableSupervisionName
                ? `${r.responsableSupervisionName} (${
                    r.responsableSupervisionCC || "-"
                  })`
                : "-";

              const defaultLabel =
                r.nextDue && r.nextDue > todayStart ? "Activo" : "Pendiente";
              const statusLabel = statusMap[r.id] || defaultLabel;
              const statusClass =
                statusLabel === "Activo"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800";

              const criticClass =
                {
                  Crítica: "bg-red-100 text-red-800",
                  Alta: "bg-amber-100 text-amber-800",
                  Media: "bg-sky-100 text-sky-800",
                  Baja: "bg-emerald-100 text-emerald-800",
                  "-": "bg-slate-100 text-slate-700",
                }[criticidad] || "bg-slate-100 text-slate-700";

              return (
                <React.Fragment key={r.id || name}>
                  <tr className={isSoonest ? "bg-amber-50" : undefined}>
                    <td className="py-2 pl-4 pr-2 align-top">
                      <p className="font-medium text-[11px] text-slate-900">
                        {name}
                        {isSoonest && (
                          <span className="ml-2 inline-block text-[10px] py-0.5 px-2 rounded bg-amber-200 text-amber-800">
                            Próximo
                          </span>
                        )}
                      </p>
                    </td>
                    <td className="py-2 pr-2 align-top text-[11px]">
                      {entity}
                    </td>
                    <td className="py-2 pr-2 align-top text-[11px]">
                      {freq}
                    </td>
                    <td className="py-2 pr-2 align-top text-[11px]">
                      {responsableElab}
                    </td>
                    <td className="py-2 pr-2 align-top text-[11px]">
                      {responsableSup}
                    </td>
                    <td className="py-2 pr-2 align-top text-[11px]">
                      {due}
                    </td>
                    <td className="py-2 pr-2 align-top text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium ${criticClass}`}
                      >
                        {criticidad}
                      </span>
                    </td>
                    <td className="py-2 pr-2 align-top text-center">
                      <button
                        onClick={() => handleToggleStatus(r.id)}
                        title="Cambiar estado (Activo / Pendiente)"
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium ${statusClass}`}
                      >
                        {statusLabel}
                      </button>
                    </td>
                    <td className="py-2 pr-4 align-top text-center">
                      <div className="inline-flex gap-1 flex-wrap justify-center">
                        <button
                          onClick={() => toggleExpand(r.id)}
                          className="px-2 py-1 rounded-lg border border-slate-200 text-[10px] hover:bg-slate-50"
                        >
                          Detalles
                        </button>
                        <button
                          onClick={() => generatePDF(r.id)}
                          className="px-2 py-1 rounded-lg border border-slate-200 text-[10px] hover:bg-slate-50"
                          title="Descargar PDF"
                        >
                          📥
                        </button>
                        {r.source === "created" && (
                          <button
                            onClick={() => handleEliminarReporte(r.id)}
                            className="px-2 py-1 rounded-lg border border-slate-200 text-[10px] hover:bg-slate-50 no-export"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedIds.includes(r.id) && (
                    <tr className="bg-slate-50">
                      <td colSpan="9" className="py-4 px-4">
                        <div className="grid grid-cols-2 gap-4">
                          {r.idReporte && (
                            <div>
                              <span className="font-medium text-[11px] text-slate-600">
                                ID Reporte:
                              </span>{" "}
                              <span className="text-[11px]">
                                {r.idReporte}
                              </span>
                            </div>
                          )}
                          {r.baseLegal && (
                            <div>
                              <span className="font-medium text-[11px] text-slate-600">
                                Base Legal:
                              </span>{" "}
                              <span className="text-[11px]">
                                {r.baseLegal}
                              </span>
                            </div>
                          )}
                          {r.telefonoResponsable && (
                            <div>
                              <span className="font-medium text-[11px] text-slate-600">
                                Teléfono:
                              </span>{" "}
                              <span className="text-[11px]">
                                {r.telefonoResponsable}
                              </span>
                            </div>
                          )}
                          {r.correosNotificacion && (
                            <div>
                              <span className="font-medium text-[11px] text-slate-600">
                                Correos de Notificación:
                              </span>{" "}
                              <span className="text-[11px]">
                                {r.correosNotificacion}
                              </span>
                            </div>
                          )}
                          {r.fechaInicio && (
                            <div>
                              <span className="font-medium text-[11px] text-slate-600">
                                Fecha de Inicio:
                              </span>{" "}
                              <span className="text-[11px]">
                                {r.fechaInicio}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-[11px] text-slate-500">
          <span>Mostrando {combinedFiltered.length} registros</span>
          <div className="flex items-center gap-1">
            <button className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50">
              ‹
            </button>
            <span className="px-2">1</span>
            <button className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50">
              2
            </button>
            <button className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-50">
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------- Components auxiliares --------- */

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

function LegendPills() {
  return (
    <div className="flex items-center gap-2">
      <LegendDot className="bg-emerald-500" label="A tiempo" />
      <LegendDot className="bg-amber-500" label="Pendiente" />
      <LegendDot className="bg-red-500" label="Vencido" />
    </div>
  );
}

function LegendDot({ className, label }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`h-2 w-2 rounded-full ${className}`} />
      <span>{label}</span>
    </span>
  );
}
