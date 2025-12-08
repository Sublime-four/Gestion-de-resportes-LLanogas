// src/pages/Reports.jsx
import React, { useState, useRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import llanogasLogo from "../assets/logo-llanogas.png";
import { useLocation } from "react-router-dom";



const reports = [];


const LLANOGAS_LOGO_BASE64 = "data:image/png;base64,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";

// Columnas esperadas en el Excel
const EXCEL_COLUMNS = {
  entidad: "Entidad",
  nombreReporte: "Nombre del reporte",
  informacion: "Información que contiene el reporte",
  periodicidad: "Periodicidad del reporte",
  cargoRespEnvio: "Cargo Responsable del envío",
  nombreRespEnvio: "Nombre del responsable del envío",
  correoRespEnvio: "Correo del responsable del envío",
  nombreLiderSeg: "Nombre del Líder responsable del seguimiento",
  correoLiderSeg: "Correo del Líder responsable del seguimiento",
  gerenciaResponsable: "Gerencia Responsable",
  marcoLegal: "Marco Legal",
  fechaLimiteEnvio: "Fecha Límite de Envío",
};

const sanitizeFileName = (str = "") =>
  String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\-]+/g, "_")
    .slice(0, 80);

function normalizeExcelDate(raw) {
  if (!raw) return "";
  if (raw instanceof Date && !isNaN(raw)) {
    return raw.toISOString().slice(0, 10);
  }
  if (typeof raw === "number") {
    // Serial Excel (base 1899-12-30)
    const excelEpoch = new Date(1899, 11, 30);
    const d = new Date(excelEpoch.getTime() + raw * 24 * 60 * 60 * 1000);
    if (!isNaN(d)) return d.toISOString().slice(0, 10);
  }
  const d = new Date(raw);
  if (!isNaN(d)) return d.toISOString().slice(0, 10);
  return String(raw);
}


// ====== PDF empresarial tipo "estado de cuenta" =========
async function generateBusinessPDF(report, formattedDue, logo = llanogasLogo) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 40;
  const marginTop = 40;

  const nowStr = new Date().toLocaleString("es-CO");

  // ----------------- NORMALIZACIÓN DE DATOS -----------------
  const entidad = report.entidadControl || report.entity || "-";
  const nombre = report.nombreReporte || report.name || "-";
  const periodicidad = report.frecuencia || report.freq || "-";
  const informacion = report.informacionContenido || report.informacion || "-";
  const cargoRespEnvio = report.cargoResponsableEnvio || "-";
  const nombreRespEnvio =
    report.responsableElaboracionName || report.nombreRespEnvio || "-";
  const correoRespEnvio =
    report.emailResponsableEnvio || report.correosNotificacion || "-";
  const nombreLiderSeg =
    report.responsableSupervisionName || report.nombreLiderSeg || "-";
  const correoLiderSeg = report.emailLiderSeguimiento || "-";
  const gerenciaResponsable = report.gerenciaResponsable || "-";
  const marcoLegal = report.baseLegal || report.marcoLegal || "-";
  const rawFechaLimite =
    report.fechaLimiteEnvio || report.fechaInicio || formattedDue;
  const fechaLimiteEnvio = rawFechaLimite
    ? normalizeExcelDate(rawFechaLimite)
    : "-";
  const telefono = report.telefonoResponsable || "-";

  // =======================================================
  // HEADER – banda superior + logo + bloque resumen derecha
  // =======================================================

  // Banda superior fina verde
  doc.setFillColor(5, 150, 105);
  doc.rect(0, 0, pageWidth, 5, "F");

  // Logo Llanogas desde base64
  const logoSize = 60; // ancho/alto en puntos
  if (LLANOGAS_LOGO_BASE64) {
    doc.addImage(
      LLANOGAS_LOGO_BASE64, // dataURL base64
      "PNG",                // tipo de imagen
      marginX,              // x
      marginTop,            // y
      logoSize,             // width
      logoSize              // height
    );
  }

  // Nombre compañía / módulo
  const titleX = marginX + 80;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("Llanogas · Gestión de Reportes", titleX, marginTop + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text("Estado de obligación regulatoria", titleX, marginTop + 30);

  // Bloque resumen a la derecha (tipo “estado de cuenta”)
  const summaryW = 220;
  const summaryX = pageWidth - marginX - summaryW;
  const summaryY = marginTop;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(209, 213, 219);
  doc.roundedRect(summaryX, summaryY, summaryW, 70, 10, 10, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("Resumen del período", summaryX + 10, summaryY + 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);

  const summaryRows = [
    ["Generado", nowStr],
    ["Entidad", entidad],
    ["Fecha límite", fechaLimiteEnvio],
    ["Periodicidad", periodicidad || "-"],
  ];

  let sy = summaryY + 30;
  summaryRows.forEach(([label, value]) => {
    doc.text(`${label}:`, summaryX + 10, sy);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(String(value || "-"), summaryX + 70, sy);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    sy += 12;
  });

  // Línea divisoria
  const lineY = marginTop + 80;
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.8);
  doc.line(marginX, lineY, pageWidth - marginX, lineY);

  let y = lineY + 16;

  // =======================================================
  // SECCIÓN 1 – IDENTIFICACIÓN GENERAL (tabla ancha)
  // =======================================================

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(55, 65, 81);
  doc.text("1. Identificación del reporte", marginX, y);
  y += 4;

  autoTable(doc, {
    startY: y + 4,
    margin: { left: marginX, right: marginX },
    styles: {
      fontSize: 9,
      cellPadding: 4,
      valign: "middle",
      textColor: [55, 65, 81],
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: 255,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 130, fontStyle: "bold", textColor: [75, 85, 99] },
      1: { cellWidth: pageWidth - marginX * 2 - 130 },
    },
    head: [["Campo", "Detalle"]],
    body: [
      ["Nombre del reporte", nombre],
      ["Entidad de control", entidad],
      ["Gerencia responsable", gerenciaResponsable || "-"],
      ["Periodicidad", periodicidad || "-"],
      ["Fecha límite de envío", fechaLimiteEnvio || "-"],
    ],
  });

  y = doc.lastAutoTable.finalY + 18;

  // Salto de página si se acerca al final
  if (y > pageHeight - 220) {
    doc.addPage();
    y = marginTop;
  }

  // =======================================================
  // SECCIÓN 2 – RESPONSABLES
  // =======================================================

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(55, 65, 81);
  doc.text("2. Responsables y contactos", marginX, y);
  y += 4;

  autoTable(doc, {
    startY: y + 4,
    margin: { left: marginX, right: marginX },
    styles: {
      fontSize: 9,
      cellPadding: 4,
      valign: "middle",
      textColor: [55, 65, 81],
    },
    headStyles: {
      fillColor: [248, 250, 252],
      textColor: [15, 23, 42],
      fontStyle: "bold",
      lineWidth: 0.5,
      lineColor: [209, 213, 219],
    },
    bodyStyles: {
      lineWidth: 0.5,
      lineColor: [226, 232, 240],
    },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { cellWidth: 140 },
      2: { cellWidth: 170 },
      3: { cellWidth: 80 },
    },
    head: [["Tipo", "Nombre", "Correo", "Teléfono"]],
    body: [
      [
        "Responsable de elaboración",
        nombreRespEnvio || "-",
        correoRespEnvio || "-",
        telefono || "-",
      ],
      [
        "Líder de seguimiento",
        nombreLiderSeg || "-",
        correoLiderSeg || "-",
        telefono || "-",
      ],
    ],
  });

  y = doc.lastAutoTable.finalY + 18;

  if (y > pageHeight - 220) {
    doc.addPage();
    y = marginTop;
  }

  // =======================================================
  // SECCIÓN 3 – INFORMACIÓN DEL REPORTE
  // =======================================================

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(55, 65, 81);
  doc.text("3. Información que contiene el reporte", marginX, y);
  y += 8;

  const infoWidth = pageWidth - marginX * 2;
  const infoLines = doc.splitTextToSize(informacion || "-", infoWidth - 12);
  const infoBoxHeight = infoLines.length * 11 + 16;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(209, 213, 219);
  doc.rect(marginX, y, infoWidth, infoBoxHeight);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(17, 24, 39);
  doc.text(infoLines, marginX + 6, y + 12);

  y += infoBoxHeight + 18;

  if (y > pageHeight - 180) {
    doc.addPage();
    y = marginTop;
  }

  // =======================================================
  // SECCIÓN 4 – MARCO LEGAL
  // =======================================================

  if (marcoLegal && String(marcoLegal).trim()) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(55, 65, 81);
    doc.text("4. Marco legal aplicable", marginX, y);
    y += 8;

    const legalWidth = pageWidth - marginX * 2;
    const legalLines = doc.splitTextToSize(String(marcoLegal), legalWidth - 12);
    const legalBoxHeight = legalLines.length * 11 + 16;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(209, 213, 219);
    doc.rect(marginX, y, legalWidth, legalBoxHeight);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(17, 24, 39);
    doc.text(legalLines, marginX + 6, y + 12);

    y += legalBoxHeight + 12;
  }

  // =======================================================
  // FOOTER – igual paleta, todas las páginas
  // =======================================================
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const footerY = pageHeight - 30;

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(marginX, footerY - 10, pageWidth - marginX, footerY - 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text("Uso interno – Confidencial", marginX, footerY);
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth - marginX,
      footerY,
      { align: "right" }
    );
  }

  const fileName = `Reporte_${sanitizeFileName(entidad)}_${sanitizeFileName(
    nombre
  )}.pdf`;
  doc.save(fileName || "reporte.pdf");
}

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
  try {
    const saved = localStorage.getItem("reportesCreados");
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
});

const reportesRef = useRef();
const fileInputRef = useRef();
const fileAttachRef = useRef();
const fileAcuseRef = useRef();
const attachTargetRef = useRef(null);

const [attachmentsMap, setAttachmentsMap] = React.useState(() => {
  try {
    const raw = localStorage.getItem("reportAttachments");
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
});

React.useEffect(() => {
  try {
    localStorage.setItem("reportAttachments", JSON.stringify(attachmentsMap));
  } catch (e) {}
}, [attachmentsMap]);

const [toasts, setToasts] = React.useState([]);
const addToast = (msg, type = "info", duration = 3000) => {
  const id = Date.now();
  setToasts((prev) => [...prev, { id, msg, type }]);
  if (duration)
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      duration
    );
};

const [alertDays, setAlertDays] = React.useState(() => {
  try {
    const raw = localStorage.getItem("alertDaysConfig");
    return raw ? JSON.parse(raw) : 7;
  } catch (e) {
    return 7;
  }
});

React.useEffect(() => {
  try {
    localStorage.setItem("alertDaysConfig", JSON.stringify(alertDays));
  } catch (e) {}
}, [alertDays]);

// Cargar reportes desde el backend y sincronizar con localStorage
React.useEffect(() => {
  const loadReports = async () => {
    try {
      const resp = await fetch("http://localhost:8080/api/reports");
      if (!resp.ok) throw new Error("Error al cargar reportes");

      const data = await resp.json();

      const withSource = data.map((r) => ({
        ...r,
        source: r.source || "created", 
      }));

      setReportesCreados(withSource);
      localStorage.setItem("reportesCreados", JSON.stringify(withSource));
    } catch (err) {
      console.error("Error cargando reportes desde el servidor", err);
      // si falla, se queda con lo que ya había en el estado (localStorage)
      addToast(
        "Error cargando reportes desde el servidor. Usando datos locales si existen.",
        "error"
      );
    }
  };

  loadReports();
}, []);

const [showAcuseHistory, setShowAcuseHistory] = React.useState(false);
const [selectedReportForHistory, setSelectedReportForHistory] =
  React.useState(null);

const [expandedIds, setExpandedIds] = useState([]);
const toggleExpand = (id) => {
  setExpandedIds((prev) =>
    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
  );
};

const [searchQuery, setSearchQuery] = useState("");
const searchLower = searchQuery.trim().toLowerCase();
const [selectedEntity, setSelectedEntity] = useState("Todas");
const [selectedFrequency, setSelectedFrequency] = useState("Todas");
const [detailReport, setDetailReport] = useState(null);
const PAGE_SIZE = 10;
const [currentPage, setCurrentPage] = useState(1);


const filteredReportes = reportesCreados.filter((rep) =>
  Object.values(rep).join(" ").toLowerCase().includes(searchLower)
);
const filteredReports = reports.filter((r) =>
  Object.values(r).join(" ").toLowerCase().includes(searchLower)
);

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
    // todavía no ha llegado ni el primer vencimiento
    return { lastDue: null, nextDue: current };
  }

  return { lastDue: current, nextDue: next };
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
  const months =
    (date.getFullYear() - now.getFullYear()) * 12 +
    (date.getMonth() - now.getMonth());
  return months;
}

function daysUntil(date) {
  if (!date) return null;
  const now = new Date();
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = Math.ceil(
    (d - new Date(now.getFullYear(), now.getMonth(), now.getDate())) /
      (1000 * 60 * 60 * 24)
  );
  return diff;
}

function criticidadFromMonths(months) {
  if (months === null || months === undefined) return "-";
  if (months <= 1) return "Crítica";
  if (months >= 2 && months <= 6) return "Alta";
  if (months >= 7 && months <= 10) return "Media";
  return "Baja";
}

function getExtendedDueDate(originalDueDate) {
  if (!originalDueDate) return null;
  const extended = new Date(originalDueDate);
  extended.setDate(extended.getDate() + 2);
  return extended;
}

// ========= LÓGICA DE ESTADOS =========

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
 * Estados:
 * - "Dentro del plazo"  -> hoy <= due y SIN acuse
 * - "Pendiente"         -> due < hoy <= due+2 días y SIN acuse
 * - "Enviado a tiempo"  -> acuseDate <= due
 * - "Enviado tarde"     -> due < acuseDate <= due+2 días
 * - "Vencido"           -> hoy > due+2 días y SIN acuse, o acuse > due+2
 */
function getReportStatus(report, attachmentsMap, todayStart) {
  const parseMaybeDate = (val) =>
    val instanceof Date ? val : val ? parseDateString(val) : null;

  // Tomamos primero lastDue (periodo actual); si no hay, nextDue (primer vencimiento futuro)
  let due = parseMaybeDate(report.lastDue) || parseMaybeDate(report.nextDue);
  if (!due || isNaN(due)) return "Dentro del plazo";

  const extended = getExtendedDueDate(due); // due + 2 días
  const acuseDate = getFirstAcuseDate(report.id, attachmentsMap);

  // --- CASO: CON ACUSE ---
  if (acuseDate) {
    if (acuseDate <= due) return "Enviado a tiempo";
    if (acuseDate > due && acuseDate <= extended) return "Enviado tarde";
    // llegó después de la ventana de gracia
    return "Vencido";
  }

  // --- CASO: SIN ACUSE ---
  if (todayStart <= due) {
    // Todavía no ha llegado el vencimiento
    return "Dentro del plazo";
  }

  if (todayStart > due && todayStart <= extended) {
    // Estamos en los 2 días de gracia
    return "Pendiente";
  }

  // Ya se pasó la ventana de gracia y no hay acuse
  return "Vencido";
}





// ========= cálculo de fechas por reporte =========

const createdWithDue = reportesCreados.map((rep) => {
  let lastDue = null;
  let nextDue = null;


  //     - Traen fechaLimiteEnvio real → usamos ESA como próximo vencimiento
  if (rep.source === "imported" && rep.fechaLimiteEnvio) {
    nextDue = parseDateString(rep.fechaLimiteEnvio);
  } else {
    // Caso reportes creados manualmente:
    //     - Se calcula por frecuencia a partir de fechaInicio
    const freq = rep.frecuencia || rep.freq;
    if (rep.fechaInicio && freq) {
      const period = computePeriodDates(rep.fechaInicio, freq);
      lastDue = period.lastDue;
      nextDue = period.nextDue;
    }
  }

  return {
    ...rep,
    lastDue, // último vencimiento del periodo actual 
    nextDue, // próximo vencimiento que usará la tabla y el estado
  };
});


const staticWithDue = reports.map((r, idx) => {
  const parsed = parseDateString(r.due);
  const id = r.id || r.name || r.nombreReporte || `static_${idx}`;
  return {
    ...r,
    id,
    lastDue: null,
    nextDue: parsed,
    source: "static",
  };
});


const combined = [...staticWithDue, ...createdWithDue].filter(
  (x) => x.nextDue != null
);
combined.sort((a, b) => a.nextDue - b.nextDue);
const soonest = combined.length ? combined[0] : null;

// helper para normalizar entidad (para comparar)
const normalizeEntity = (s) => String(s || "").trim().toLowerCase();

const entityOptions = React.useMemo(() => {
  const map = new Map();

  combined.forEach((x) => {
    const raw = (x.entity || x.entidadControl || "").trim();
    if (!raw) return;

    const norm = normalizeEntity(raw);

    if (!map.has(norm)) {
      let pretty = raw;
      if (raw !== raw.toUpperCase()) {
        pretty = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
      }
      map.set(norm, pretty);
    }
  });

  return ["Todas", ...Array.from(map.values())];
}, [combined]);

const now = new Date();
const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

// ========= KPIs basados en estados calculados =========

const totalReports = combined.length;

const countOverdue = combined.filter(
  (r) => getReportStatus(r, attachmentsMap, todayStart) === "Vencido"
).length;

const countPending = combined.filter(
  (r) => getReportStatus(r, attachmentsMap, todayStart) === "Dentro del plazo"
).length;

const countOnTimeOrInWindow = combined.filter((r) => {
  const st = getReportStatus(r, attachmentsMap, todayStart);
  return st === "Dentro del plazo" || st === "Enviado a tiempo";
}).length;

const percentOnTime = totalReports
  ? Math.round((countOnTimeOrInWindow / totalReports) * 100)
  : 0;

const ALERT_DAYS = 7;
const upcoming = combined.filter((r) => {
  const d = daysUntil(r.nextDue);
  if (d === null) return false;
  const hasAcuse =
    attachmentsMap[r.id] &&
    attachmentsMap[r.id].some((a) => a.kind === "acuse");
  return d >= 0 && d <= ALERT_DAYS && !hasAcuse;
});
const upcomingCount = upcoming.length;

const combinedFiltered = combined.filter((x) => {
  const matchesSearch = Object.values(x)
    .join(" ")
    .toLowerCase()
    .includes(searchLower);

  const reportEntityRaw = x.entity || x.entidadControl || "";
  const matchesEntity =
    selectedEntity === "Todas" ||
    normalizeEntity(reportEntityRaw) === normalizeEntity(selectedEntity);

  const reportFreq = (x.freq || x.frecuencia || "-").trim();
  const matchesFreq =
    selectedFrequency === "Todas" || reportFreq === selectedFrequency;

  return matchesSearch && matchesEntity && matchesFreq;
});

const totalPages = Math.max(
  1,
  Math.ceil(combinedFiltered.length / PAGE_SIZE)
);

const startIndex = (currentPage - 1) * PAGE_SIZE;
const currentPageItems = combinedFiltered.slice(
  startIndex,
  startIndex + PAGE_SIZE
);


const location = useLocation();
const openedFromQueryRef = React.useRef(false);

React.useEffect(() => {
  // ya abrimos una vez desde el querystring, no volver a hacerlo
  if (openedFromQueryRef.current) return;

  const params = new URLSearchParams(location.search);
  const reportId = params.get("reportId");
  if (!reportId) return;

  const match = combined.find((r) => String(r.id) === String(reportId));
  if (!match) return;

  openedFromQueryRef.current = true; // marcamos como atendido
  setDetailReport(match);
}, [location.search, combined]);


// al cambiar filtros/búsqueda, volvemos a página 1
React.useEffect(() => {
  setCurrentPage(1);
}, [searchQuery, selectedEntity, selectedFrequency]);

// si se reduce el número de registros y la página actual ya no existe
React.useEffect(() => {
  if (currentPage > totalPages) {
    setCurrentPage(totalPages);
  }
}, [totalPages, currentPage]);


  React.useEffect(() => {
    localStorage.setItem("reportesCreados", JSON.stringify(reportesCreados));
  }, [reportesCreados]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoReporte({ ...nuevoReporte, [name]: value });
  };

 const handleAgregarReporte = async () => {
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

  const freqValid = validateFrequency(nuevoReporte.frecuencia) || null;
  if (!freqValid) {
    alert(
      "Frecuencia no válida. Use: Mensual, Trimestral, Semestral o Anual."
    );
    return;
  }

  // payload que se envía al backend
  const payload = {
    ...nuevoReporte,
    frecuencia: freqValid,
    source: "created",
  };

  try {
    const resp = await fetch("http://localhost:8080/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      console.error("Error al guardar en backend", resp.status);
      addToast("Error al guardar el reporte en el servidor.", "error");
      return;
    }

    const saved = await resp.json();

  
    const reporteGuardado = {
      ...saved,
      source: saved.source || "created",
    };

    setReportesCreados((prev) => [...prev, reporteGuardado]);

    addToast("Reporte creado y guardado en base de datos.", "success");

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
  } catch (err) {
    console.error("Error al guardar el reporte", err);
    addToast(
      "Error de conexión al guardar el reporte en el servidor.",
      "error"
    );
  }
};


// --- Importar desde Excel  ---
const handleImportButton = () => {
  if (fileInputRef.current) fileInputRef.current.click();
};

// Normaliza encabezados / keys (quita acentos, NBSP, símbolos raros)
const normalizeKey = (h) =>
  String(h || "")
    .normalize("NFD")                 // separa acentos
    .replace(/[\u0300-\u036f]/g, "")  // quita diacríticos
    .replace(/\u00A0/g, " ")          // NBSP -> espacio normal
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, "")      // solo letras/números/espacio
    .replace(/\s+/g, " ")             // colapsa espacios
    .trim();

const handleFileChange = async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  try {
    const XLSX = await import("xlsx");
    const reader = new FileReader();

    reader.onload = async (ev) => {
      try {
        const data = ev.target.result;
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // 1) VALIDAR QUE ESTÉN TODOS LOS HEADERS REQUERIDOS
        const headerRowRaw =
          XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
          })[0] || [];

        console.log("HEADER RAW EXCEL:", headerRowRaw);

        const normalizedHeaders = headerRowRaw.map(normalizeKey);

        const required = Object.values(EXCEL_COLUMNS).map((label) => ({
          label,                  // texto tal cual lo ve el usuario
          norm: normalizeKey(label), // versión normalizada
        }));

        const missing = required.filter(
          (req) => !normalizedHeaders.includes(req.norm)
        );

        if (missing.length) {
          const missingPretty = missing.map((m) => m.label);
          addToast(
            `El archivo Excel no tiene todas las columnas requeridas. Faltan: ${missingPretty.join(
              ", "
            )}`,
            "error"
          );
          return;
        }

        // 2) LEER FILAS
        const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        const imported = rows.map((row) => {
          // get que busca por encabezado exacto y por encabezado normalizado
          const get = (headerLabel) => {
            // 1) intento directo
            if (
              row[headerLabel] !== undefined &&
              row[headerLabel] !== null &&
              row[headerLabel] !== ""
            ) {
              return row[headerLabel];
            }

            const targetNorm = normalizeKey(headerLabel);

            // 2) intento por headers normalizados 1 a 1
            for (const [key, value] of Object.entries(row)) {
              if (normalizeKey(key) === targetNorm) {
                return value ?? "";
              }
            }
            return "";
          };

          // usamos get también para la fecha, así soporta tildes, puntos, etc.
          const fechaRaw = get(EXCEL_COLUMNS.fechaLimiteEnvio);

          const correoResp = get(EXCEL_COLUMNS.correoRespEnvio);
          const correoLider = get(EXCEL_COLUMNS.correoLiderSeg);
          const correosNotificacion = [correoResp, correoLider]
            .filter(Boolean)
            .join(", ");

          return {
            nombreReporte: get(EXCEL_COLUMNS.nombreReporte),
            entidadControl: get(EXCEL_COLUMNS.entidad),
            informacionContenido: get(EXCEL_COLUMNS.informacion),
            frecuencia:
              validateFrequency(get(EXCEL_COLUMNS.periodicidad)) || "Mensual",
            cargoResponsableEnvio: get(EXCEL_COLUMNS.cargoRespEnvio),
            responsableElaboracionName: get(EXCEL_COLUMNS.nombreRespEnvio),
            emailResponsableEnvio: correoResp,
            responsableSupervisionName: get(EXCEL_COLUMNS.nombreLiderSeg),
            emailLiderSeguimiento: correoLider,
            gerenciaResponsable: get(EXCEL_COLUMNS.gerenciaResponsable),
            baseLegal: get(EXCEL_COLUMNS.marcoLegal),
            fechaInicio: normalizeExcelDate(fechaRaw),
            fechaLimiteEnvio: normalizeExcelDate(fechaRaw),
            telefonoResponsable: "",
            correosNotificacion,
          };
        });

        // 3) VALIDAR QUE CADA FILA TENGA TODOS LOS CAMPOS OBLIGATORIOS
        const isRowComplete = (it) =>
          it.entidadControl &&
          it.nombreReporte &&
          it.informacionContenido &&
          it.frecuencia &&
          it.cargoResponsableEnvio &&
          it.responsableElaboracionName &&
          it.emailResponsableEnvio &&
          it.responsableSupervisionName &&
          it.emailLiderSeguimiento &&
          it.gerenciaResponsable &&
          it.baseLegal &&
          it.fechaLimiteEnvio;

        const valid = imported.filter(isRowComplete);

        if (valid.length !== imported.length) {
          addToast(
            `Algunas filas no tienen todos los campos obligatorios y se omitieron. Válidas: ${valid.length} de ${imported.length}`,
            "info"
          );
        }

        if (!valid.length) {
          addToast("No hay filas válidas para importar.", "error");
          return;
        }

        // 4) POST AL BACKEND
        try {
          const resp = await fetch("http://localhost:8080/api/reports/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(valid),
          });

          if (!resp.ok) {
            console.error("Error al guardar en backend", resp.status);
            addToast(
              "Error al guardar los reportes en el servidor.",
              "error"
            );
            return;
          }

      const saved = await resp.json();

// Taggear como importados solo a nivel frontend
const savedWithSource = saved.map((r) => ({
  ...r,
  source: r.source || "imported",
}));

setReportesCreados((prev) => [...prev, ...savedWithSource]);


          addToast(
            `Importación completada: ${saved.length} registros agregados en base de datos.`,
            "success"
          );
        } catch (err) {
          console.error("Error parseando Excel o llamando al backend", err);
          addToast(
            "Error al procesar el archivo o guardar en el servidor.",
            "error"
          );
        }
      } catch (err) {
        console.error("Error parseando Excel", err);
        addToast(
          "Error al leer el archivo Excel. Revisa la consola.",
          "error"
        );
      }
    };

    reader.readAsArrayBuffer(file);
  } catch (err) {
    console.error(
      'Necesita instalar la dependencia xlsx: npm install xlsx',
      err
    );
    addToast(
      'La importación requiere la librería "xlsx". Ejecuta: npm install xlsx',
      "error"
    );
  } finally {
    e.target.value = "";
  }
};



const handleDeleteAttachment = (reportId, attachmentId) => {
  setAttachmentsMap((prev) => {
    const list = (prev[reportId] || []).filter((a) => a.id !== attachmentId);
    if (!list.length) {
      const { [reportId]: _, ...rest } = prev;
      return rest;
    }
    return { ...prev, [reportId]: list };
  });
  addToast("Archivo eliminado.", "info");
};

const openAcuseHistory = (report) => {
  setSelectedReportForHistory(report);
  setShowAcuseHistory(true);
};

const handleEliminarReporte = async (id) => {
  if (!id) {
    // No hay id válido -> limpio solo en frontend/localStorage
    setReportesCreados((prev) => prev.filter((rep) => rep.id !== id));
    addToast(
      "Reporte eliminado solo de la vista (no tenía id en base de datos).",
      "info"
    );
    return;
  }

  if (!window.confirm("¿Seguro que quieres eliminar este reporte?")) return;

  try {
    const resp = await fetch(`http://localhost:8080/api/reports/${id}`, {
      method: "DELETE",
    });

    // Si falla por otro motivo distinto de 404, sí lo consideramos error
    if (!resp.ok && resp.status !== 404) {
      addToast("Error al eliminar el reporte en el servidor.", "error");
      return;
    }

    // En cualquier caso (OK o 404) lo quitamos del estado/localStorage
    setReportesCreados((prev) => prev.filter((rep) => rep.id !== id));

    if (resp.status === 404) {
      addToast(
        "El reporte no existía en la base de datos, se eliminó solo de la vista.",
        "info"
      );
    } else {
      addToast("Reporte eliminado correctamente.", "success");
    }
  } catch (err) {
    console.error("Error eliminando reporte", err);
    addToast("Error de conexión al eliminar el reporte.", "error");
  }
};

  // Nuevo generatePDF que usa el PDF empresarial
  const generatePDF = (reportId) => {
    if (!reportId) return;
    const report = combined.find((r) => r.id === reportId);
    if (!report) return;
    const due =
      report.nextDue instanceof Date
        ? formatDate(report.nextDue)
        : report.nextDue
        ? formatDate(parseDateString(report.nextDue))
        : "-";
    generateBusinessPDF(report, due, llanogasLogo);

  };

  return (
    <div className="space-y-6">
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 space-y-2 z-50 max-w-sm">
        {toasts.map((t) => {
          const colors = {
            success: "bg-emerald-100 border-emerald-300 text-emerald-800",
            error: "bg-red-100 border-red-300 text-red-800",
            info: "bg-sky-100 border-sky-300 text-sky-800",
          };
          return (
            <div
              key={t.id}
              className={`border rounded px-4 py-2 text-sm ${
                colors[t.type] || colors.info
              }`}
            >
              {t.msg}
            </div>
          );
        })}
      </div>

      {/* Alert configuration */}
      <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-900">
            Configurar días de alerta
          </p>
          <p className="text-[11px] text-slate-500">
            Días antes de vencimiento para mostrar alerta
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max="30"
            value={alertDays}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (val > 0) setAlertDays(val);
            }}
            className="w-16 border rounded px-2 py-1 text-sm"
          />
          <span className="text-sm text-slate-600">días</span>
        </div>
      </div>
  {/* Resumen ejecutivo */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <MetricCard
        label="Reportes configurados"
        value={totalReports}
        helper="Portafolio total de obligaciones."
      />
      <MetricCard
        label="Dentro del plazo"
        value={countPending}
        tone="warning"
        helper="Con fecha límite vigente y sin acuse."
      />
      <MetricCard
        label="Vencidos"
        value={countOverdue}
        tone="danger"
        helper="Fecha límite + periodo de gracia superado y sin acuse."
      />
      <MetricCard
        label="% a tiempo (YTD)"
        value={`${percentOnTime}%`}
        tone="success"
        helper="Enviados a tiempo o aún dentro del plazo."
      />
    </div>

    {/* Filtros + vista */}
    {upcomingCount > 0 && (
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
        {`Hay ${upcomingCount} reporte(s) con vencimiento en los próximos ${ALERT_DAYS} días sin acuse.`}
      </div>
    )}
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
              {entityOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
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
          <button
            onClick={handleImportButton}
            className="ml-2 inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 h-9 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Importar Excel
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <input
            ref={fileAttachRef}
            type="file"
            accept=".pdf,.xlsx,.xls,.csv,.doc,.docx"
            onChange={(e) => handleAttachFileChange(e, "evidence")}
            style={{ display: "none" }}
          />
          <input
            ref={fileAcuseRef}
            type="file"
            accept=".pdf,.jpg,.png,.jpeg"
            onChange={(e) => handleAttachFileChange(e, "acuse")}
            style={{ display: "none" }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px]">
        <div />
        <span className="text-slate-500 hidden md:inline">
          Vista de trabajo del portafolio regulatorio.
        </span>
      </div>
    </div>

    {/* Modal acuse history */}
    {showAcuseHistory && selectedReportForHistory && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
          <h2 className="text-lg font-bold mb-4">
            Historial de acuses - {selectedReportForHistory.nombreReporte}
          </h2>
          <div className="space-y-3">
            {(attachmentsMap[selectedReportForHistory.id] || []).filter(
              (a) => a.kind === "acuse"
            ).length > 0 ? (
              (attachmentsMap[selectedReportForHistory.id] || [])
                .filter((a) => a.kind === "acuse")
                .map((a) => (
                  <div key={a.id} className="border rounded p-3 bg-slate-50">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm text-slate-900">
                          {a.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Cargado: {new Date(a.uploadedAt).toLocaleString()}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Tamaño: {(a.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <a
                          href={a.dataUrl}
                          download={a.name}
                          className="px-2 py-1 rounded border border-slate-200 text-[11px] hover:bg-slate-50"
                        >
                          Descargar
                        </a>
                        <button
                          onClick={() => {
                            if (confirm("¿Eliminar este acuse?"))
                              handleDeleteAttachment(
                                selectedReportForHistory.id,
                                a.id
                              );
                          }}
                          className="px-2 py-1 rounded border border-red-200 text-[11px] text-red-600 hover:bg-red-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-slate-500 text-sm">
                No hay acuses en el historial.
              </p>
            )}
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowAcuseHistory(false)}
              className="flex-1 px-4 py-2 border rounded text-sm font-medium hover:bg-slate-50"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    )}
{/* Modal para nuevo reporte (estilo corporativo) */}
{showModal && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    onClick={() => setShowModal(false)}
  >
    <div
      className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[28px] bg-slate-950/95 text-slate-50 shadow-[0_20px_80px_rgba(15,23,42,0.65)] border border-slate-900/40"
      onClick={(e) => e.stopPropagation()}
    >
      {/* HEADER */}
      <div className="px-7 pt-6 pb-4 border-b border-white/10 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-300">
              Nuevo reporte regulatorio
            </p>
            <h2 className="text-2xl font-semibold leading-snug">
              Crear nuevo reporte
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-200">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Configuración de obligación
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1">
                Los campos marcados con * son obligatorios
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <button
              onClick={() => setShowModal(false)}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-slate-50 hover:bg-white/10"
            >
              Cerrar
              <span className="text-xs">✕</span>
            </button>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="bg-slate-50 text-slate-800 max-h-[75vh] overflow-y-auto modal-scroll px-7 py-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Columna izquierda */}
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-[0.12em]">
                ID Reporte *
              </label>
              <input
                type="text"
                name="idReporte"
                value={nuevoReporte.idReporte}
                onChange={handleInputChange}
                placeholder="Ej: REP001"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-[0.12em]">
                Nombre del reporte *
              </label>
              <input
                type="text"
                name="nombreReporte"
                value={nuevoReporte.nombreReporte}
                onChange={handleInputChange}
                placeholder="Ej: Información Comercial"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-[0.12em]">
                Entidad de control
              </label>
              <input
                type="text"
                name="entidadControl"
                value={nuevoReporte.entidadControl}
                onChange={handleInputChange}
                placeholder="Ej: SUI, Superservicios, ANH"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-[0.12em]">
                Base legal
              </label>
              <textarea
                name="baseLegal"
                value={nuevoReporte.baseLegal}
                onChange={handleInputChange}
                placeholder="Normativas o leyes principales"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs h-20 resize-none focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400"
              />
            </div>
          </div>

          {/* Columna derecha */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-[0.12em]">
                  Resp. elaboración - Nombre
                </label>
                <input
                  type="text"
                  name="responsableElaboracionName"
                  value={nuevoReporte.responsableElaboracionName}
                  onChange={handleInputChange}
                  placeholder="Nombre completo"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-[0.12em]">
                  Resp. elaboración - CC
                </label>
                <input
                  type="text"
                  name="responsableElaboracionCC"
                  value={nuevoReporte.responsableElaboracionCC}
                  onChange={handleInputChange}
                  placeholder="Documento (solo números)"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-[0.12em]">
                  Resp. supervisión - Nombre
                </label>
                <input
                  type="text"
                  name="responsableSupervisionName"
                  value={nuevoReporte.responsableSupervisionName}
                  onChange={handleInputChange}
                  placeholder="Nombre completo"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-[0.12em]">
                  Resp. supervisión - CC
                </label>
                <input
                  type="text"
                  name="responsableSupervisionCC"
                  value={nuevoReporte.responsableSupervisionCC}
                  onChange={handleInputChange}
                  placeholder="Documento (solo números)"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-[0.12em]">
                  Teléfono responsable
                </label>
                <input
                  type="tel"
                  name="telefonoResponsable"
                  value={nuevoReporte.telefonoResponsable}
                  onChange={handleInputChange}
                  placeholder="Ej: +57 300 0000000"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-[0.12em]">
                  Frecuencia
                </label>
                <select
                  name="frecuencia"
                  value={nuevoReporte.frecuencia}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400"
                >
                  <option>Mensual</option>
                  <option>Trimestral</option>
                  <option>Semestral</option>
                  <option>Anual</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-[0.12em]">
                Correos de notificación
              </label>
              <textarea
                name="correosNotificacion"
                value={nuevoReporte.correosNotificacion}
                onChange={handleInputChange}
                placeholder="Lista de emails separada por comas"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs h-20 resize-none focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-[0.12em]">
                  Fecha inicio vigencia
                </label>
                <input
                  type="date"
                  name="fechaInicio"
                  value={nuevoReporte.fechaInicio}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER BOTONES */}
        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3 border-t border-slate-200 pt-4">
          <button
            onClick={() => setShowModal(false)}
            className="px-4 py-2 rounded-full border border-slate-300 bg-white text-[12px] font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleAgregarReporte}
            className="px-5 py-2 rounded-full bg-slate-900 text-[12px] font-medium text-white shadow-sm hover:bg-slate-800"
          >
            Agregar reporte
          </button>
        </div>
      </div>
    </div>
  </div>
)}


  {/* Modal de detalles del reporte (versión corporativa) */}
    {detailReport &&
      (() => {
        const dueDate =
          detailReport.fechaLimiteEnvio ||
          (detailReport.nextDue instanceof Date
            ? formatDate(detailReport.nextDue)
            : detailReport.nextDue
            ? formatDate(parseDateString(detailReport.nextDue))
            : "-");

        const criticidad = criticidadFromMonths(
          detailReport.nextDue ? monthsUntil(detailReport.nextDue) : null
        );

        const entidad =
          detailReport.entidadControl || detailReport.entity || "Sin entidad";
        const frecuencia = detailReport.frecuencia || detailReport.freq || "-";
        const nombre =
          detailReport.nombreReporte ||
          detailReport.name ||
          "Reporte sin nombre";

        const statusLabel = getReportStatus(
          detailReport,
          attachmentsMap,
          todayStart
        );

const statusClass =
  {
    "Dentro del plazo": "bg-sky-100 text-sky-800",
    Pendiente: "bg-amber-500 text-amber-800",         
    "Enviado a tiempo": "bg-emerald-100 text-emerald-800",
    "Enviado tarde": "bg-amber-100 text-amber-800",
    Vencido: "bg-red-100 text-red-800",
  }[statusLabel] || "bg-slate-100 text-slate-700";



        const criticClass =
          {
            Crítica: "bg-red-50 text-red-800 border-red-100",
            Alta: "bg-amber-50 text-amber-800 border-amber-100",
            Media: "bg-sky-50 text-sky-800 border-sky-100",
            Baja: "bg-emerald-50 text-emerald-800 border-emerald-100",
            "-": "bg-slate-50 text-slate-600 border-slate-100",
          }[criticidad] || "bg-slate-50 text-slate-600 border-slate-100";

        return (
          <div
            className="fixed inset-0 w-screen h-screen z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setDetailReport(null)}
          >
            <div
              className="relative w-full max-w-6xl max-h-[94vh] overflow-y-auto rounded-[32px] bg-slate-50 shadow-[0_20px_80px_rgba(15,23,42,0.35)] border border-slate-900/10 modal-scroll"
              onClick={(e) => e.stopPropagation()}
            >
              {/* HEADER */}
              <div className="border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-8 pt-6 pb-5">
                <div className="flex items-start justify-between gap-6">
                  <div className="space-y-2">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-slate-300">
                      Detalle del reporte regulatorio
                    </p>
                    <h2 className="text-2xl font-semibold leading-snug">
                      {nombre}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        {entidad}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1">
                        Frecuencia:{" "}
                        <span className="font-medium">{frecuencia}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1">
                        Próximo vencimiento:{" "}
                        <span className="font-medium">{dueDate}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => setDetailReport(null)}
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-slate-50 hover:bg-white/10"
                    >
                      Cerrar
                      <span className="text-xs">✕</span>
                    </button>
                    <button
                      onClick={() => generatePDF(detailReport.id)}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-slate-900 shadow-sm hover:bg-slate-50"
                    >
                      <span className="text-sm">📄</span>
                      Descargar ficha PDF
                    </button>
                  </div>
                </div>

                {/* KPI strip */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
                  <div className="flex items-center gap-2 rounded-2xl bg-black/10 px-3 py-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black/30 text-xs">
                      ⏱
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-300">
                        Vencimiento
                      </p>
                      <p className="font-medium text-slate-50">{dueDate}</p>
                    </div>
                  </div>
                  <div
                    className={`flex items-center gap-2 rounded-2xl px-3 py-2 border ${criticClass}`}
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/40 text-xs">
                      ⚠️
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] opacity-70">
                        Criticidad
                      </p>
                      <p className="font-medium">{criticidad}</p>
                    </div>
                  </div>
                  <div
                    className={`flex items-center gap-2 rounded-2xl px-3 py-2 border ${statusClass}`}
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/50 text-xs">
                      ●
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] opacity-70">
                        Estado
                      </p>
                      <p className="font-medium">{statusLabel}</p>
                    </div>
                  </div>
                </div>
              </div>

          {/* BODY */}
          <div className="px-8 py-6 space-y-6 text-[11px] text-slate-800 bg-slate-50/60">
            {/* Identificación + Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <section className="space-y-2">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.18em]">
                  Identificación
                </p>
                <div className="rounded-2xl bg-white border border-slate-100 px-4 py-3.5 shadow-sm space-y-1.5">
                  {detailReport.idReporte && (
                    <p>
                      <span className="text-slate-500">ID reporte: </span>
                      <span className="font-medium">
                        {detailReport.idReporte}
                      </span>
                    </p>
                  )}
                  <p>
                    <span className="text-slate-500">Entidad de control: </span>
                    {entidad}
                  </p>
                  <p>
                    <span className="text-slate-500">
                      Gerencia responsable:{" "}
                    </span>
                    {detailReport.gerenciaResponsable || "-"}
                  </p>
                  <p>
                    <span className="text-slate-500">Base legal: </span>
                    {detailReport.baseLegal || detailReport.marcoLegal || "-"}
                  </p>
                </div>
              </section>

              <section className="space-y-2">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.18em]">
                  Fechas
                </p>
                <div className="rounded-2xl bg-white border border-slate-100 px-4 py-3.5 shadow-sm space-y-1.5">
                  <p>
                    <span className="text-slate-500">
                      Fecha inicio vigencia:{" "}
                    </span>
                    {detailReport.fechaInicio || "-"}
                  </p>
                  <p>
                    <span className="text-slate-500">
                      Fecha límite de envío:{" "}
                    </span>
                    {dueDate}
                  </p>
                </div>
              </section>
            </div>

            {/* Responsables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <section className="space-y-2">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.18em]">
                  Responsable elaboración
                </p>
                <div className="rounded-2xl bg-white border border-slate-100 px-4 py-3.5 shadow-sm space-y-1.5">
                  <p>
                    <span className="text-slate-500">Nombre: </span>
                    {detailReport.responsableElaboracionName || "-"}
                  </p>
                  <p>
                    <span className="text-slate-500">CC: </span>
                    {detailReport.responsableElaboracionCC || "-"}
                  </p>
                  <p>
                    <span className="text-slate-500">
                      Correo responsable envío:{" "}
                    </span>
                    {detailReport.emailResponsableEnvio || "-"}
                  </p>
                </div>
              </section>

              <section className="space-y-2">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.18em]">
                  Responsable supervisión
                </p>
                <div className="rounded-2xl bg-white border border-slate-100 px-4 py-3.5 shadow-sm space-y-1.5">
                  <p>
                    <span className="text-slate-500">Nombre: </span>
                    {detailReport.responsableSupervisionName || "-"}
                  </p>
                  <p>
                    <span className="text-slate-500">CC: </span>
                    {detailReport.responsableSupervisionCC || "-"}
                  </p>
                  <p>
                    <span className="text-slate-500">Teléfono: </span>
                    {detailReport.telefonoResponsable || "-"}
                  </p>
                  <p>
                    <span className="text-slate-500">
                      Correos notificación:{" "}
                    </span>
                    {detailReport.correosNotificacion || "-"}
                  </p>
                </div>
              </section>
            </div>

            {/* Información */}
            <section className="space-y-2">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.18em]">
                Información que contiene el reporte
              </p>
              <div className="rounded-2xl bg-white border border-slate-100 px-4 py-3.5 shadow-sm">
                <p className="text-[11px] leading-relaxed text-slate-800 whitespace-pre-wrap">
                  {detailReport.informacionContenido ||
                    detailReport.informacion ||
                    "-"}
                </p>
              </div>
            </section>

            {/* Marco legal */}
            {(detailReport.baseLegal || detailReport.marcoLegal) && (
              <section className="space-y-2">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.18em]">
                  Marco legal
                </p>
                <div className="rounded-2xl bg-white border border-slate-100 px-4 py-3.5 shadow-sm">
                  <p className="text-[11px] leading-relaxed text-slate-800 whitespace-pre-wrap">
                    {detailReport.baseLegal || detailReport.marcoLegal}
                  </p>
                </div>
              </section>
            )}

            {/* Documentos asociados */}
            <section className="space-y-2 border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.18em]">
                  Documentos asociados
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mb-2">
                <button
                  onClick={() => handleOpenAttach(detailReport.id)}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] hover:bg-slate-50"
                >
                  Adjuntar soporte
                </button>
                <button
                  onClick={() => handleOpenAcuse(detailReport.id)}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] hover:bg-slate-50"
                >
                  Adjuntar acuse
                </button>
                {attachmentsMap[detailReport.id] &&
                  attachmentsMap[detailReport.id].some(
                    (a) => a.kind === "acuse"
                  ) && (
                    <button
                      onClick={() => openAcuseHistory(detailReport)}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] hover:bg-slate-50"
                    >
                      Ver historial de acuses
                    </button>
                  )}
              </div>

              <div className="space-y-1 text-[11px]">
                {(attachmentsMap[detailReport.id] || []).map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between gap-2 rounded-2xl bg-white px-3 py-2 border border-slate-100 shadow-sm"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <a
                        href={a.dataUrl}
                        download={a.name}
                        title={a.name}
                        className="text-sky-600 hover:underline truncate text-[10px]"
                      >
                        {a.name}
                      </a>
                      <span className="text-slate-500 text-[10px] whitespace-nowrap">
                        {a.kind}
                      </span>
                      <span className="text-slate-400 text-[10px] whitespace-nowrap">
                        • {new Date(a.uploadedAt).toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm("¿Eliminar este archivo?"))
                          handleDeleteAttachment(detailReport.id, a.id);
                      }}
                      className="px-2 py-0.5 rounded-full border border-red-200 text-[10px] text-red-600 hover:bg-red-50"
                      title="Eliminar"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {!((attachmentsMap[detailReport.id] || []).length) && (
                  <div className="text-slate-500 text-[11px]">
                    No hay archivos adjuntos.
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  })()}

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
            Gestión centralizada de vencimientos, responsables y criticidad por
            entidad.
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
          {currentPageItems.map((r) => {
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

            const criticClass =
              {
                Crítica: "bg-red-100 text-red-800",
                Alta: "bg-amber-100 text-amber-800",
                Media: "bg-sky-100 text-sky-800",
                Baja: "bg-emerald-100 text-emerald-800",
                "-": "bg-slate-100 text-slate-700",
              }[criticidad] || "bg-slate-100 text-slate-700";

            
            const statusLabel = getReportStatus(r, attachmentsMap, todayStart);
          const statusClass =
  {
    "Dentro del plazo":
      "bg-sky-200 text-sky-900 border-sky-300",
    Pendiente:
      "bg-amber-200 text-amber-900 border-amber-300",   
    "Enviado a tiempo":
      "bg-emerald-200 text-emerald-900 border-emerald-300",
    "Enviado tarde":
      "bg-amber-200 text-amber-900 border-amber-300",
    Vencido:
      "bg-red-200 text-red-900 border-red-300",
  }[statusLabel] || "bg-slate-200 text-slate-800 border-slate-300";

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
                  <td className="py-2 pr-2 align-top text-[11px]">{freq}</td>
                  <td className="py-2 pr-2 align-top text-[11px]">
                    {responsableElab}
                  </td>
                  <td className="py-2 pr-2 align-top text-[11px]">
                    {responsableSup}
                  </td>
                  <td className="py-2 pr-2 align-top text-[11px]">{due}</td>
                  <td className="py-2 pr-2 align-top text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium ${criticClass}`}
                    >
                      {criticidad}
                    </span>
                  </td>
                  <td className="py-2 pr-2 align-top text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium ${statusClass}`}
                    >
                      {statusLabel}
                    </span>
                  </td>
                  <td className="py-2 pr-4 align-top text-center">
                    <div className="inline-flex gap-1 flex-wrap justify-center">
                      <button
                        onClick={() => setDetailReport(r)}
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
                      {r.source !== "static" && (
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

                          <div className="col-span-2">
                            <div className="flex gap-2 items-center mb-2">
                              <button
                                onClick={() => handleOpenAttach(r.id)}
                                className="px-3 py-1 rounded-lg border border-slate-200 text-[11px] hover:bg-slate-50"
                              >
                                Adjuntar soporte
                              </button>
                              <button
                                onClick={() => handleOpenAcuse(r.id)}
                                className="px-3 py-1 rounded-lg border border-slate-200 text-[11px] hover:bg-slate-50"
                              >
                                Adjuntar acuse
                              </button>
                              {attachmentsMap[r.id] &&
                                attachmentsMap[r.id].some(
                                  (a) => a.kind === "acuse"
                                ) && (
                                  <>
                                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800">
                                      Acuse cargado
                                    </span>
                                    <button
                                      onClick={() => openAcuseHistory(r)}
                                      className="px-2 py-1 rounded-lg border border-slate-200 text-[11px] hover:bg-slate-50"
                                    >
                                      Ver historial
                                    </button>
                                  </>
                                )}
                            </div>

                            <div className="space-y-1 text-[11px]">
                              {(attachmentsMap[r.id] || []).map((a) => (
                                <div
                                  key={a.id}
                                  className="flex items-center justify-between gap-2 bg-slate-100 p-2 rounded"
                                >
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <a
                                      href={a.dataUrl}
                                      download={a.name}
                                      title={a.name}
                                      className="text-sky-600 hover:underline truncate text-[10px]"
                                    >
                                      {a.name}
                                    </a>
                                    <span className="text-slate-500 text-[10px] whitespace-nowrap">
                                      {a.kind}
                                    </span>
                                    <span className="text-slate-400 text-[10px] whitespace-nowrap">
                                      •{" "}
                                      {new Date(
                                        a.uploadedAt
                                      ).toLocaleString()}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => {
                                      if (
                                        confirm("¿Eliminar este archivo?")
                                      )
                                        handleDeleteAttachment(r.id, a.id);
                                    }}
                                    className="px-2 py-0.5 rounded border border-red-200 text-[10px] text-red-600 hover:bg-red-50"
                                    title="Eliminar"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                              {!(
                                attachmentsMap[r.id] || []
                              ).length && (
                                <div className="text-slate-500">
                                  No hay archivos adjuntos.
                                </div>
                              )}
                            </div>
                          </div>
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
  <span>
    Mostrando{" "}
    {combinedFiltered.length === 0
      ? "0"
      : `${startIndex + 1}-${Math.min(
          startIndex + PAGE_SIZE,
          combinedFiltered.length
        )}`}{" "}
    de {combinedFiltered.length} registros
  </span>

  <div className="flex items-center gap-1">
    <button
      onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
      disabled={currentPage === 1}
      className={`px-2 py-1 rounded-lg border border-slate-200 ${
        currentPage === 1
          ? "opacity-40 cursor-not-allowed"
          : "hover:bg-slate-50"
      }`}
    >
      ‹
    </button>

    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
      <button
        key={page}
        onClick={() => setCurrentPage(page)}
        className={`px-2 py-1 rounded-lg border border-slate-200 ${
          page === currentPage
            ? "bg-slate-900 text-white"
            : "hover:bg-slate-50"
        }`}
      >
        {page}
      </button>
    ))}

    <button
      onClick={() =>
        currentPage < totalPages && setCurrentPage(currentPage + 1)
      }
      disabled={currentPage === totalPages}
      className={`px-2 py-1 rounded-lg border border-slate-200 ${
        currentPage === totalPages
          ? "opacity-40 cursor-not-allowed"
          : "hover:bg-slate-50"
      }`}
    >
      ›
    </button>
  </div>
</div>

      </div>
    </div>
  );
}

/* Components */

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
          <p className="text-[11px] text-slate-600 leading-snug">{helper}</p>
        )}
      </div>
    </div>
  );
}

function LegendPills() {
  return (
    <div className="flex items-center gap-2">
      <LegendDot className="bg-sky-500" label="Dentro del plazo" />
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
  