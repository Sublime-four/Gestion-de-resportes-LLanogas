// ---------------------------------------------
// Reports.jsx — FULL COMPLIANCE EDITION
// Integración: Entities.jsx (entidadId como FK)
// Periodos automáticos según frecuencia
// Entregables backend-ready (sin base64)
// Cálculo automático de vencimientos y estados
// ---------------------------------------------

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";

import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

// -------------------------
//   CONSTANTES GLOBALES
// -------------------------

export const FRECUENCIAS = ["Mensual", "Trimestral", "Semestral", "Anual"];

export const ESTADOS_OPERATIVOS = [
  "Pendiente",
  "En elaboración",
  "En revisión",
  "Enviado",
];

export const ESTADOS_SEGUIMIENTO = [
  "A tiempo",
  "Enviado tarde",
  "Vencido",
  "Dentro del plazo",
];

export const MESES_TRIMESTRE = {
  1: ["01", "02", "03"],
  2: ["04", "05", "06"],
  3: ["07", "08", "09"],
  4: ["10", "11", "12"],
};

// -------------------------
//   UTILIDADES DE FECHA
// -------------------------

export function parseDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d) ? null : d;
}

export function formatYMD(date) {
  if (!date) return "";
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function formatDMY(date) {
  if (!date) return "";
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addMonthsSafe(date, months) {
  const d = new Date(date);
  const originalDay = d.getDate();
  d.setMonth(d.getMonth() + months);

  // Ajustar por meses cortos
  if (d.getDate() !== originalDay) {
    d.setDate(0);
  }
  return d;
}

export function monthsBetween(from, to) {
  if (!from || !to) return null;
  const a = new Date(from);
  const b = new Date(to);
  return (
    (b.getFullYear() - a.getFullYear()) * 12 +
    (b.getMonth() - a.getMonth())
  );
}

// Criticidad según meses restantes
export function criticidadFromMonths(months) {
  if (months == null) return "-";
  if (months <= 1) return "Crítica";
  if (months <= 6) return "Alta";
  if (months <= 10) return "Media";
  return "Baja";
}

// Estado seguimiento automático
export function computeEstadoSeguimiento(real, venc) {
  if (!venc) return "Dentro del plazo";
  const v = new Date(venc);

  // Si no hay envío → vencido
  if (!real) {
    return new Date() > v ? "Vencido" : "Dentro del plazo";
  }

  const r = new Date(real);
  if (r <= v) return "A tiempo";
  return "Enviado tarde";
}

// ---------------------------------------------------------
//    CÁLCULO DE VENCIMIENTOS AUTOMÁTICOS POR FRECUENCIA
// ---------------------------------------------------------

/**
 * Crea un objeto con info de periodo
 * {
 *   id: number,
 *   periodo: string,
 *   fechaVencimiento: string (YYYY-MM-DD),
 *   reporteFinalUrl: "",
 *   evidenciaUrl: "",
 *   comentarios: "",
 *   fechaEnvioReal: "",
 *   estadoSeguimiento: "A tiempo" | "Enviado tarde" | "Vencido" | "Dentro del plazo"
 * }
 */
export function makePeriodo({
  periodo,
  vencimiento,
}) {
  return {
    id: Date.now() + Math.random(), // temporal
    periodo,
    fechaVencimiento: formatYMD(vencimiento),
    reporteFinalUrl: "",
    evidenciaUrl: "",
    comentarios: "",
    fechaEnvioReal: "",
    estadoSeguimiento: computeEstadoSeguimiento(null, vencimiento),
  };
}

/**
 * Calcula el vencimiento aplicando:
 * - día de vencimiento (opcional)
 * - mes de vencimiento (para anual/trimestral)
 * - plazo adicional de días
 */
export function computeVencimientoBase({
  fechaInicio,
  frecuencia,
  diaVencimiento,
  mesVencimiento,
  plazoAdicionalDias,
  periodoDate,
}) {
  if (!periodoDate) return null;

  const base = new Date(periodoDate);

  // Día de vencimiento
  if (diaVencimiento) {
    base.setDate(Number(diaVencimiento));
  } else {
    // si no se define, usar último día del mes
    base.setDate(new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate());
  }

  // Mes de vencimiento (solo anual / trimestral)
  if ((frecuencia === "Anual" || frecuencia === "Trimestral") && mesVencimiento) {
    base.setMonth(Number(mesVencimiento) - 1);
  }

  if (!isNaN(base)) {
    if (plazoAdicionalDias) {
      return addDays(base, Number(plazoAdicionalDias));
    }
    return base;
  }

  return null;
}

// ---------------------------------------------------------
//    GENERACIÓN AUTOMÁTICA DE PERIODOS POR FRECUENCIA
// ---------------------------------------------------------

export function generatePeriodos(report) {
  const {
    fechaInicio,
    frecuencia,
    diaVencimiento,
    mesVencimiento,
    plazoAdicionalDias,
  } = report;

  if (!fechaInicio || !frecuencia) return [];

  const start = new Date(fechaInicio);
  const year = start.getFullYear();

  const periodos = [];

  // ---------------------------
  //   MENSUAL
  // ---------------------------
  if (frecuencia === "Mensual") {
    for (let m = 0; m < 12; m++) {
      const periodoDate = new Date(year, m, 1);
      const periodo = periodoDate.toLocaleString("es", {
        month: "long",
        year: "numeric",
      });

      const venc = computeVencimientoBase({
        fechaInicio,
        frecuencia,
        diaVencimiento,
        mesVencimiento,
        plazoAdicionalDias,
        periodoDate,
      });

      periodos.push(
        makePeriodo({
          periodo: capitalize(periodo),
          vencimiento: venc,
        })
      );
    }
  }

  // ---------------------------
  //   TRIMESTRAL
  // ---------------------------
  if (frecuencia === "Trimestral") {
    const trimestres = [
      { name: "1T", month: 0 },
      { name: "2T", month: 3 },
      { name: "3T", month: 6 },
      { name: "4T", month: 9 },
    ];

    for (const t of trimestres) {
      const periodoDate = new Date(year, t.month, 1);
      const periodo = `${t.name}-${year}`;

      const venc = computeVencimientoBase({
        fechaInicio,
        frecuencia,
        diaVencimiento,
        mesVencimiento,
        plazoAdicionalDias,
        periodoDate,
      });

      periodos.push(
        makePeriodo({
          periodo,
          vencimiento: venc,
        })
      );
    }
  }

  // ---------------------------
  //   SEMESTRAL
  // ---------------------------
  if (frecuencia === "Semestral") {
    const semestres = [
      { name: "1S", month: 0 },
      { name: "2S", month: 6 },
    ];

    for (const s of semestres) {
      const periodoDate = new Date(year, s.month, 1);
      const periodo = `${s.name}-${year}`;

      const venc = computeVencimientoBase({
        fechaInicio,
        frecuencia,
        diaVencimiento,
        mesVencimiento,
        plazoAdicionalDias,
        periodoDate,
      });

      periodos.push(
        makePeriodo({
          periodo,
          vencimiento: venc,
        })
      );
    }
  }

  // ---------------------------
  //   ANUAL
  // ---------------------------
  if (frecuencia === "Anual") {
    const periodoDate = new Date(year, 0, 1);
    const periodo = `${year}`;

    const venc = computeVencimientoBase({
      fechaInicio,
      frecuencia,
      diaVencimiento,
      mesVencimiento,
      plazoAdicionalDias,
      periodoDate,
    });

    periodos.push(
      makePeriodo({
        periodo,
        vencimiento: venc,
      })
    );
  }

  return periodos;
}

// Utilidad estética
function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ---------------------------------------------
//   ALMACENAMIENTO LOCAL / CONSTANTES REPORTS
// ---------------------------------------------

const LOCAL_STORAGE_REPORTS_KEY = "reportsV2";

// Para compatibilidad con tu archivo original (si quieres luego mapear estáticos)
const STATIC_REPORTS = []; // por ahora vacío, listo para backend

// ---------------------------
//   HOY NORMALIZADO
// ---------------------------

function getTodayStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function monthsUntil(date) {
  if (!date) return null;
  const today = getTodayStart();
  return monthsBetween(today, date);
}

// ---------------------------------------------
//          COMPONENTE PRINCIPAL
// ---------------------------------------------

export default function Reports() {
  const [showModal, setShowModal] = useState(false);
  const [editingReportId, setEditingReportId] = useState(null);

  // Catálogo de entidades desde el mismo localStorage que usa Entities.jsx
  const [entities, setEntities] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("entities");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Reportes V2 (nuevo modelo)
  const [reports, setReports] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_REPORTS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntityId, setSelectedEntityId] = useState("Todas");
  const [selectedFrequency, setSelectedFrequency] = useState("Todas");

  // Reporte en edición / creación
  const [formReport, setFormReport] = useState(getEmptyReportForm());

  const reportesRef = useRef(null);

  // Persistencia
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LOCAL_STORAGE_REPORTS_KEY, JSON.stringify(reports));
    } catch {
      // ignore
    }
  }, [reports]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("entities");
      setEntities(raw ? JSON.parse(raw) : []);
    } catch {
      setEntities([]);
    }
  }, []);

  // ---------------------------------------------
  //     DERIVADOS (MÉTRICAS, LISTAS, ETC.)
  // ---------------------------------------------

  const today = getTodayStart();

  // Agrega datos derivados a cada reporte: entidad, próximo vencimiento, criticidad
  const reportsWithDerived = useMemo(() => {
    return reports.map((r) => {
      const entidad = entities.find((e) => e.id === r.entidadId) || null;
      const allVencimientos = (r.periodos || [])
        .map((p) => parseDate(p.fechaVencimiento))
        .filter(Boolean)
        .sort((a, b) => a - b);

      // Próximo vencimiento: el primer vencimiento >= hoy, o el más cercano pasado si todos vencieron
      let nextDue = null;
      for (const v of allVencimientos) {
        if (v >= today) {
          nextDue = v;
          break;
        }
      }
      if (!nextDue && allVencimientos.length > 0) {
        nextDue = allVencimientos[allVencimientos.length - 1];
      }

      const months = nextDue ? monthsUntil(nextDue) : null;
      const criticidad = criticidadFromMonths(months);

      // Contar periodos vencidos vs cumplidos
      const totalPeriodos = (r.periodos || []).length;
      const vencidos = (r.periodos || []).filter((p) => {
        const v = parseDate(p.fechaVencimiento);
        if (!v) return false;
        const estado = computeEstadoSeguimiento(p.fechaEnvioReal, v);
        return estado === "Vencido";
      }).length;

      return {
        ...r,
        entidad,
        nextDue,
        criticidad,
        totalPeriodos,
        vencidos,
      };
    });
  }, [reports, entities, today]);

    // ---------------------------------------------
  //   Filtro de búsqueda y selectores
  // ---------------------------------------------
  const filteredReports = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return reportsWithDerived.filter((r) => {
      const reportEntityName = r.entidad ? r.entidad.name : "";
      const matchesSearch =
        !q ||
        (r.idReporte || "").toLowerCase().includes(q) ||
        (r.nombreReporte || "").toLowerCase().includes(q) ||
        (reportEntityName || "").toLowerCase().includes(q) ||
        (r.baseLegal || "").toLowerCase().includes(q) ||
        (r.resolucion || "").toLowerCase().includes(q);

      const matchesEntity =
        selectedEntityId === "Todas"
          ? true
          : String(r.entidadId) === String(selectedEntityId);

      const freq = r.frecuencia || "-";
      const matchesFreq =
        selectedFrequency === "Todas" ? true : freq === selectedFrequency;

      return matchesSearch && matchesEntity && matchesFreq;
    });
  }, [
    reportsWithDerived,
    searchQuery,
    selectedEntityId,
    selectedFrequency,
  ]);


  const metrics = useMemo(() => {
    const totalReports = reportsWithDerived.length;

    // --- KPIs por instancia de obligación (periodos) ---
    let totalObligaciones = 0;
    let totalVencidas = 0;
    let totalATiempo = 0;
    let totalTarde = 0;
    let totalPendientes = 0;
    const retrasos = [];

    const incumplimientosPorEntidad = {};
    const incumplimientosPorResponsable = {};

    reportsWithDerived.forEach((r) => {
      (r.periodos || []).forEach((p) => {
        const v = parseDate(p.fechaVencimiento);
        if (!v) return;

        const estado = computeEstadoSeguimiento(p.fechaEnvioReal, v);
        totalObligaciones += 1;

        if (estado === "Vencido") {
          totalVencidas += 1;
        } else if (estado === "A tiempo") {
          totalATiempo += 1;
        } else if (estado === "Enviado tarde") {
          totalTarde += 1;

          const real = parseDate(p.fechaEnvioReal);
          if (real && real > v) {
            const diffMs = real - v;
            const diffDays = diffMs / (1000 * 60 * 60 * 24);
            if (diffDays > 0) {
              retrasos.push(diffDays);
            }
          }
        } else if (estado === "Dentro del plazo") {
          totalPendientes += 1;
        }

        // Incumplimientos: Vencido o Enviado tarde
        const esIncumplimiento =
          estado === "Vencido" || estado === "Enviado tarde";

        if (esIncumplimiento) {
          const entName = r.entidad?.name || "Sin entidad";
          incumplimientosPorEntidad[entName] =
            (incumplimientosPorEntidad[entName] || 0) + 1;

          const resp = r.responsableElaboracionName || "Sin responsable";
          incumplimientosPorResponsable[resp] =
            (incumplimientosPorResponsable[resp] || 0) + 1;
        }
      });
    });

    const porcentajeCumplimientoATiempo = totalObligaciones
      ? Math.round((totalATiempo / totalObligaciones) * 100)
      : 0;

    const diasRetrasoPromedio =
      retrasos.length > 0
        ? retrasos.reduce((a, b) => a + b, 0) / retrasos.length
        : null;

    function maxEntry(map) {
      let maxName = "-";
      let maxVal = 0;
      Object.entries(map).forEach(([name, val]) => {
        if (val > maxVal) {
          maxVal = val;
          maxName = name;
        }
      });
      return { name: maxName, count: maxVal };
    }

    const entidadMayorIncumplimiento = maxEntry(incumplimientosPorEntidad);
    const responsableMayorIncumplimiento = maxEntry(
      incumplimientosPorResponsable
    );

    // --- Métricas que ya usabas a nivel "reporte" ---
    const vencidosReports = reportsWithDerived.filter(
      (r) => r.nextDue && r.nextDue < today
    ).length;
    const pendientesReports = reportsWithDerived.filter(
      (r) => r.nextDue && r.nextDue >= today
    ).length;
    const sinVencidos = totalReports - vencidosReports;
    const percentOnTime = totalReports
      ? Math.round((sinVencidos / totalReports) * 100)
      : 0;

    return {
      // métricas antiguas (para no romper nada)
      totalReports,
      vencidosReports,
      pendientesReports,
      percentOnTime,

      // KPIs nuevos alineados con la tabla
      totalObligaciones,
      totalObligacionesVencidas: totalVencidas,
      totalEnviadasATiempo: totalATiempo,
      totalEnviadasTarde: totalTarde,
      totalPendientesNoEnviadas: totalPendientes,
      porcentajeCumplimientoATiempo,
      diasRetrasoPromedio,
      entidadMayorIncumplimiento,
      responsableMayorIncumplimiento,
    };
  }, [reportsWithDerived, today]);

  // ---------------------------------------------
  //           HANDLERS DE FORMULARIO
  // ---------------------------------------------

  function getEmptyReportForm() {
    return {
      idReporte: "",
      nombreReporte: "",
      entidadId: "",
      baseLegal: "",
      resolucion: "",
      formatoEnvio: "",
      linkInstructivo: "",
      fechaInicio: "",
      fechaFinVigencia: "",
      diaVencimiento: "",
      mesVencimiento: "",
      plazoAdicionalDias: "",
      responsableElaboracionName: "",
      responsableElaboracionCC: "",
      responsableSupervisionName: "",
      responsableSupervisionCC: "",
      telefonoResponsable: "",
      correosNotificacion: "",
      frecuencia: "Mensual",
      estadoOperativo: "Pendiente",
    };
  }

  const handleOpenNew = () => {
    setFormReport(getEmptyReportForm());
    setEditingReportId(null);
    setShowModal(true);
  };

  const handleEditReport = (reportId) => {
    const r = reports.find((x) => x.id === reportId);
    if (!r) return;
    const {
      periodos, // no va en formulario simple
      ...base
    } = r;
    setFormReport({
      ...getEmptyReportForm(),
      ...base,
      entidadId: r.entidadId || "",
    });
    setEditingReportId(reportId);
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormReport((prev) => ({ ...prev, [name]: value }));
  };

  const validateReportForm = () => {
    if (!formReport.idReporte.trim()) {
      alert("El ID del reporte es obligatorio.");
      return false;
    }
    if (!formReport.nombreReporte.trim()) {
      alert("El nombre del reporte es obligatorio.");
      return false;
    }
    if (!formReport.fechaInicio) {
      alert("La fecha de inicio de vigencia es obligatoria.");
      return false;
    }
    if (!formReport.entidadId) {
      alert("Debe seleccionar una entidad de control.");
      return false;
    }

    // Nombres solo letras y espacios
    const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
    if (
      formReport.responsableElaboracionName &&
      !nameRegex.test(formReport.responsableElaboracionName)
    ) {
      alert(
        "El nombre del responsable de elaboración debe contener solo letras y espacios."
      );
      return false;
    }
    if (
      formReport.responsableSupervisionName &&
      !nameRegex.test(formReport.responsableSupervisionName)
    ) {
      alert(
        "El nombre del responsable de supervisión debe contener solo letras y espacios."
      );
      return false;
    }

    // CC solo números
    const ccRegex = /^\d*$/;
    if (
      formReport.responsableElaboracionCC &&
      !ccRegex.test(formReport.responsableElaboracionCC)
    ) {
      alert(
        "La cédula/CC del responsable de elaboración debe contener solo números."
      );
      return false;
    }
    if (
      formReport.responsableSupervisionCC &&
      !ccRegex.test(formReport.responsableSupervisionCC)
    ) {
      alert(
        "La cédula/CC del responsable de supervisión debe contener solo números."
      );
      return false;
    }

    // Teléfono numérico
    if (
      formReport.telefonoResponsable &&
      formReport.telefonoResponsable.trim()
    ) {
      const digitsOnly = formReport.telefonoResponsable.replace(/\s+/g, "");
      if (!/^\d+$/.test(digitsOnly)) {
        alert("El teléfono del responsable debe contener solo números.");
        return false;
      }
    }

    // Link a instructivo debe ser URL válida si viene diligenciado
    if (formReport.linkInstructivo && formReport.linkInstructivo.trim()) {
      const raw = formReport.linkInstructivo.trim();
      const withProto =
        raw.startsWith("http://") || raw.startsWith("https://")
          ? raw
          : `https://${raw}`;

      try {
        // eslint-disable-next-line no-new
        new URL(withProto);
      } catch {
        alert("El link a instructivo no es una URL válida.");
        return false;
      }
    }

    // Correos de notificación
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formReport.correosNotificacion?.trim()) {
      const emails = formReport.correosNotificacion
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const invalid = emails.find((e) => !emailRegex.test(e));
      if (invalid) {
        alert(
          `La lista de correos contiene una dirección inválida: ${invalid}`
        );
        return false;
      }
    }

    return true;
  };

  const handleSaveReport = () => {
    if (!validateReportForm()) return;

    const baseReport = {
      ...formReport,
      entidadId: Number(formReport.entidadId),
    };

    // Generar periodos automáticos solo si es nuevo reporte
    let periodos = [];
    if (!editingReportId) {
      periodos = generatePeriodos(baseReport);
    } else {
      // si es edición, mantener periodos existentes
      const existing = reports.find((r) => r.id === editingReportId);
      periodos = existing?.periodos || [];
    }

    if (editingReportId) {
      setReports((prev) =>
        prev.map((r) =>
          r.id === editingReportId
            ? {
                ...r,
                ...baseReport,
                periodos,
              }
            : r
        )
      );
    } else {
      const newReport = {
        id: Date.now(),
        ...baseReport,
        periodos,
      };
      setReports((prev) => [...prev, newReport]);
    }

    setShowModal(false);
    setEditingReportId(null);
    setFormReport(getEmptyReportForm());
  };

  const handleDeleteReport = (id) => {
    if (
      !window.confirm(
        "¿Eliminar este reporte? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  const handleEstadoOperativoChange = (id, value) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              estadoOperativo: value,
            }
          : r
      )
    );
  };

  // Actualizar un periodo de un reporte
  const handleUpdatePeriodo = useCallback((reportId, periodoId, patch) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== reportId) return r;
        const updatedPeriodos = (r.periodos || []).map((p) => {
          if (p.id !== periodoId) return p;
          const merged = { ...p, ...patch };

          // Recalcular estadoSeguimiento automáticamente
          const v = parseDate(merged.fechaVencimiento);
          merged.estadoSeguimiento = computeEstadoSeguimiento(
            merged.fechaEnvioReal,
            v
          );
          return merged;
        });
        return { ...r, periodos: updatedPeriodos };
      })
    );
  }, []);

  // ---------------------------------------------
  //              GENERACIÓN DE PDF
  // ---------------------------------------------

  const generatePDF = async (reportId) => {
    const report = reportsWithDerived.find((r) => r.id === reportId);
    if (!report) return;

    const entidadName = report.entidad?.name || "-";
    const entidadCode = report.entidad?.code || "-";

    const due =
      report.nextDue instanceof Date ? formatDMY(report.nextDue) : "-";

    const months = report.nextDue ? monthsUntil(report.nextDue) : null;
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

    const estadoOperativo = report.estadoOperativo || "Pendiente";

    const ultimoPeriodo =
      (report.periodos || [])
        .slice()
        .sort((a, b) => {
          const va = parseDate(a.fechaVencimiento) || new Date(0);
          const vb = parseDate(b.fechaVencimiento) || new Date(0);
          return vb - va;
        })[0] || null;

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
        <h1 style="margin: 0; font-size: 24px; color: #1f2937;">Ficha de Reporte Regulatorio</h1>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr style="background-color: #f3f4f6;">
          <td style="border: 1px solid #d1d5db; padding: 12px; font-weight: bold; width: 40%;">ID / Nombre del reporte:</td>
          <td style="border: 1px solid #d1d5db; padding: 12px;">${report.idReporte} — ${report.nombreReporte}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #d1d5db; padding: 12px; font-weight: bold;">Entidad de control:</td>
          <td style="border: 1px solid #d1d5db; padding: 12px;">${entidadName} (${entidadCode})</td>
        </tr>
        <tr style="background-color: #f3f4f6;">
          <td style="border: 1px solid #d1d5db; padding: 12px; font-weight: bold;">Frecuencia:</td>
          <td style="border: 1px solid #d1d5db; padding: 12px;">${report.frecuencia}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #d1d5db; padding: 12px; font-weight: bold;">Formato requerido / de envío:</td>
          <td style="border: 1px solid #d1d5db; padding: 12px;">${report.formatoEnvio || "-"}</td>
        </tr>
        <tr style="background-color: #f3f4f6;">
          <td style="border: 1px solid #d1d5db; padding: 12px; font-weight: bold;">Link a instructivo:</td>
          <td style="border: 1px solid #d1d5db; padding: 12px;">${report.linkInstructivo || "-"}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #d1d5db; padding: 12px; font-weight: bold;">Próximo vencimiento (calculado):</td>
          <td style="border: 1px solid #d1d5db; padding: 12px;">${due}</td>
        </tr>
        <tr style="background-color: #f3f4f6;">
          <td style="border: 1px solid #d1d5db; padding: 12px; font-weight: bold;">Parámetros de vencimiento:</td>
          <td style="border: 1px solid #d1d5db; padding: 12px;">
            Día venc.: ${report.diaVencimiento || "-"} · Mes venc.: ${
      report.mesVencimiento || "-"
    } · Plazo adicional: ${report.plazoAdicionalDias || 0} días
          </td>
        </tr>
        <tr>
          <td style="border: 1px solid #d1d5db; padding: 12px; font-weight: bold;">Criticidad (portafolio):</td>
          <td style="border: 1px solid #d1d5db; padding: 12px;">${criticidad}</td>
        </tr>
        <tr style="background-color: #f3f4f6;">
          <td style="border: 1px solid #d1d5db; padding: 12px; font-weight: bold;">Estado operativo:</td>
          <td style="border: 1px solid #d1d5db; padding: 12px;">${estadoOperativo}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #d1d5db; padding: 12px; font-weight: bold;">Fecha de inicio de vigencia:</td>
          <td style="border: 1px solid #d1d5db; padding: 12px;">${
            report.fechaInicio || "-"
          }</td>
        </tr>
        <tr style="background-color: #f3f4f6;">
          <td style="border: 1px solid #d1d5db; padding: 12px; font-weight: bold;">Fecha de fin de vigencia:</td>
          <td style="border: 1px solid #d1d5db; padding: 12px;">${
            report.fechaFinVigencia || "-"
          }</td>
        </tr>
        ${
          report.baseLegal
            ? `<tr>
                 <td style="border: 1px solid #d1d5db; padding: 12px; font-weight: bold;">Base legal:</td>
                 <td style="border: 1px solid #d1d5db; padding: 12px;">${report.baseLegal}</td>
               </tr>`
            : ""
        }
        ${
          report.resolucion
            ? `<tr style="background-color: #f3f4f6;">
                 <td style="border: 1px solid #d1d5db; padding: 12px; font-weight: bold;">Resolución / Norma específica:</td>
                 <td style="border: 1px solid #d1d5db; padding: 12px;">${report.resolucion}</td>
               </tr>`
            : ""
        }
        <tr>
          <td style="border: 1px solid #d1d5db; padding: 12px; font-weight: bold;">Responsable (elaboración):</td>
          <td style="border: 1px solid #d1d5db; padding: 12px;">${responsableElab}</td>
        </tr>
        <tr style="background-color: #f3f4f6;">
          <td style="border: 1px solid #d1d5db; padding: 12px; font-weight: bold;">Responsable (supervisión):</td>
          <td style="border: 1px solid #d1d5db; padding: 12px;">${responsableSup}</td>
        </tr>
        ${
          report.telefonoResponsable
            ? `<tr>
                 <td style="border: 1px solid #d1d5db; padding: 12px; font-weight: bold;">Teléfono responsable:</td>
                 <td style="border: 1px solid #d1d5db; padding: 12px;">${report.telefonoResponsable}</td>
               </tr>`
            : ""
        }
        ${
          report.correosNotificacion
            ? `<tr style="background-color: #f3f4f6;">
                 <td style="border: 1px solid #d1d5db; padding: 12px; font-weight: bold;">Correos de notificación:</td>
                 <td style="border: 1px solid #d1d5db; padding: 12px;">${report.correosNotificacion}</td>
               </tr>`
            : ""
        }
      </table>

      ${
        ultimoPeriodo
          ? `
        <h2 style="font-size:16px; margin: 0 0 8px 0; color:#111827;">Último periodo registrado</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr style="background-color:#f9fafb;">
            <td style="border: 1px solid #d1d5db; padding: 8px; font-weight:bold; width:40%;">Periodo</td>
            <td style="border: 1px solid #d1d5db; padding: 8px;">${ultimoPeriodo.periodo}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #d1d5db; padding: 8px; font-weight:bold;">Fecha de vencimiento</td>
            <td style="border: 1px solid #d1d5db; padding: 8px;">${
              ultimoPeriodo.fechaVencimiento || "-"
            }</td>
          </tr>
          <tr style="background-color:#f9fafb;">
            <td style="border: 1px solid #d1d5db; padding: 8px; font-weight:bold;">Estado seguimiento</td>
            <td style="border: 1px solid #d1d5db; padding: 8px;">${
              ultimoPeriodo.estadoSeguimiento
            }</td>
          </tr>
          <tr>
            <td style="border: 1px solid #d1d5db; padding: 8px; font-weight:bold;">Fecha envío real</td>
            <td style="border: 1px solid #d1d5db; padding: 8px;">${
              ultimoPeriodo.fechaEnvioReal || "-"
            }</td>
          </tr>
          ${
            ultimoPeriodo.reporteFinalUrl
              ? `<tr style="background-color:#f9fafb;">
                  <td style="border: 1px solid #d1d5db; padding: 8px; font-weight:bold;">Reporte final (URL)</td>
                  <td style="border: 1px solid #d1d5db; padding: 8px;">${ultimoPeriodo.reporteFinalUrl}</td>
                 </tr>`
              : ""
          }
          ${
            ultimoPeriodo.evidenciaUrl
              ? `<tr>
                  <td style="border: 1px solid #d1d5db; padding: 8px; font-weight:bold;">Evidencia de envío (URL)</td>
                  <td style="border: 1px solid #d1d5db; padding: 8px;">${ultimoPeriodo.evidenciaUrl}</td>
                 </tr>`
              : ""
          }
          ${
            ultimoPeriodo.comentarios
              ? `<tr style="background-color:#f9fafb;">
                  <td style="border: 1px solid #d1d5db; padding: 8px; font-weight:bold;">Comentarios / observaciones</td>
                  <td style="border: 1px solid #d1d5db; padding: 8px;">${ultimoPeriodo.comentarios}</td>
                 </tr>`
              : ""
          }
        </table>
      `
          : ""
      }
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
      const safeName = (report.nombreReporte || "reporte")
        .replace(/[^\w\d]+/g, "_")
        .toLowerCase();
      pdf.save(`reporte_${safeName}.pdf`);
    } finally {
      document.body.removeChild(container);
    }
  };

  // ---------------------------------------------
  //                  RENDER
  // ---------------------------------------------

  return (
    <div className="space-y-6">
      {/* Resumen ejecutivo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          label="Reportes configurados"
          value={metrics.totalReports}
          helper="Total de obligaciones parametrizadas."
        />
        <MetricCard
          label="Pendientes / próximos"
          value={metrics.pendientesReports}
          tone="warning"
          helper="Reportes con vencimiento hoy o a futuro."
        />
        <MetricCard
          label="Vencidos"
          value={metrics.vencidosReports}
          tone="danger"
          helper="Reportes con vencimientos expirados."
        />
        <MetricCard
          label="% sin vencidos"
          value={`${metrics.percentOnTime}%`}
          tone="success"
          helper="Porcentaje de reportes sin vencimientos vencidos."
        />
      </div>

      {/* Filtros + acciones */}
      <div className="bg-white rounded-2xl border border-slate-200 px-4 py-4 md:px-5 md:py-4 flex flex-col gap-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                Entidad
              </span>
              <select
                value={selectedEntityId}
                onChange={(e) => setSelectedEntityId(e.target.value)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <option value="Todas">Todas</option>
                {entities.map((ent) => (
                  <option key={ent.id} value={ent.id}>
                    {ent.code} — {ent.name}
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
                {FRECUENCIAS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar en reportes (ID, nombre, entidad, base legal, resoluciones...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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

      {/* Modal de reporte */}
      {showModal && (
        <ReportModal
          entities={entities}
          form={formReport}
          onChange={handleFormChange}
          onClose={() => {
            setShowModal(false);
            setEditingReportId(null);
            setFormReport(getEmptyReportForm());
          }}
          onSave={handleSaveReport}
          isEditing={!!editingReportId}
        />
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
              {filteredReports.length} registro(s) encontrado(s)
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
              <th className="py-2 font-medium">Estado operativo</th>
              <th className="py-2 pr-4 text-center font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredReports.map((r) => {
              const isSoonest = soonest && soonest.id === r.id;

              const entityName = r.entidad ? r.entidad.name : "-";
              const entityCode = r.entidad ? r.entidad.code : "-";

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

              const due = r.nextDue ? formatDMY(r.nextDue) : "-";

              const criticClass =
                {
                  Crítica: "bg-red-100 text-red-800",
                  Alta: "bg-amber-100 text-amber-800",
                  Media: "bg-sky-100 text-sky-800",
                  Baja: "bg-emerald-100 text-emerald-800",
                  "-": "bg-slate-100 text-slate-700",
                }[r.criticidad] || "bg-slate-100 text-slate-700";

              const estadoOperativo = r.estadoOperativo || "Pendiente";
              const estadoClass =
                {
                  Pendiente: "bg-amber-100 text-amber-800",
                  "En elaboración": "bg-sky-100 text-sky-800",
                  "En revisión": "bg-indigo-100 text-indigo-800",
                  Enviado: "bg-emerald-100 text-emerald-800",
                }[estadoOperativo] || "bg-slate-100 text-slate-700";

              const [expanded, setExpanded] = [null, null]; // placeholder mental; usaremos componente colapsable abajo real

              return (
                <ReportRow
                  key={r.id}
                  report={r}
                  entityName={entityName}
                  entityCode={entityCode}
                  responsableElab={responsableElab}
                  responsableSup={responsableSup}
                  due={due}
                  criticClass={criticClass}
                  estadoOperativo={estadoOperativo}
                  estadoClass={estadoClass}
                  isSoonest={isSoonest}
                  onChangeEstado={handleEstadoOperativoChange}
                  onDelete={handleDeleteReport}
                  onEdit={handleEditReport}
                  onGeneratePDF={generatePDF}
                  onUpdatePeriodo={handleUpdatePeriodo}
                />
              );
            })}

            {filteredReports.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="py-6 text-center text-[11px] text-slate-500"
                >
                  No hay reportes configurados o no coinciden con los filtros.
                  Crea un nuevo reporte para empezar a parametrizar el
                  portafolio regulatorio.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-[11px] text-slate-500">
          <span>Mostrando {filteredReports.length} registro(s).</span>
          <div className="flex items-center gap-1">
            {/* Paginación placeholder, lista para backend */}
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

// ---------------------------------------------
//    ROW DE REPORTE + DETALLE COLAPSABLE
// ---------------------------------------------

function ReportRow({
  report,
  entityName,
  entityCode,
  responsableElab,
  responsableSup,
  due,
  criticClass,
  estadoOperativo,
  estadoClass,
  isSoonest,
  onChangeEstado,
  onDelete,
  onEdit,
  onGeneratePDF,
  onUpdatePeriodo,
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr className={isSoonest ? "bg-amber-50" : undefined}>
        <td className="py-2 pl-4 pr-2 align-top">
          <p className="font-medium text-[11px] text-slate-900">
            {report.nombreReporte}
            {isSoonest && (
              <span className="ml-2 inline-block text-[10px] py-0.5 px-2 rounded bg-amber-200 text-amber-800">
                Próximo
              </span>
            )}
          </p>
          <p className="text-[10px] text-slate-500">{report.idReporte}</p>
        </td>
        <td className="py-2 pr-2 align-top text-[11px]">
          {entityName}{" "}
          {entityCode && (
            <span className="text-[10px] text-slate-400">({entityCode})</span>
          )}
        </td>
        <td className="py-2 pr-2 align-top text-[11px]">
          {report.frecuencia}
        </td>
        <td className="py-2 pr-2 align-top text-[11px]">
          {responsableElab}
        </td>
        <td className="py-2 pr-2 align-top text-[11px]">
          {responsableSup}
        </td>
        <td className="py-2 pr-2 align-top text-[11px]">
          {due || "-"}
        </td>
        <td className="py-2 pr-2 align-top text-center">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium ${criticClass}`}
          >
            {report.criticidad}
          </span>
        </td>
        <td className="py-2 pr-2 align-top text-center">
          <div
            className={`inline-flex items-center px-2 py-0.5 rounded-full ${estadoClass}`}
          >
            <select
              value={estadoOperativo}
              onChange={(e) => onChangeEstado(report.id, e.target.value)}
              className="bg-transparent border-none text-[10px] font-medium focus:outline-none cursor-pointer"
            >
              {ESTADOS_OPERATIVOS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </td>
        <td className="py-2 pr-4 align-top text-center">
          <div className="inline-flex gap-1 flex-wrap justify-center">
            <button
              onClick={() => setExpanded((prev) => !prev)}
              className="px-2 py-1 rounded-lg border border-slate-200 text-[10px] hover:bg-slate-50"
            >
              {expanded ? "Ocultar" : "Detalles"}
            </button>
            <button
              onClick={() => onGeneratePDF(report.id)}
              className="px-2 py-1 rounded-lg border border-slate-200 text-[10px] hover:bg-slate-50"
              title="Descargar PDF"
            >
              📥
            </button>
            <button
              onClick={() => onEdit(report.id)}
              className="px-2 py-1 rounded-lg border border-slate-200 text-[10px] hover:bg-slate-50"
            >
              Editar
            </button>
            <button
              onClick={() => onDelete(report.id)}
              className="px-2 py-1 rounded-lg border border-slate-200 text-[10px] hover:bg-slate-50"
            >
              Eliminar
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-slate-50">
          <td colSpan={9} className="py-4 px-4">
            <ReportDetails report={report} onUpdatePeriodo={onUpdatePeriodo} />
          </td>
        </tr>
      )}
    </>
  );
}

// ---------------------------------------------
//          DETALLE DE REPORTE (COLLAPSE)
// ---------------------------------------------

function ReportDetails({ report, onUpdatePeriodo }) {
  return (
    <div className="grid grid-cols-2 gap-4 text-[11px]">
      {/* Metadatos básicos */}
      {report.baseLegal && (
        <div className="col-span-2">
          <span className="font-medium text-slate-600">Base legal:</span>{" "}
          <span>{report.baseLegal}</span>
        </div>
      )}
      {report.resolucion && (
        <div className="col-span-2">
          <span className="font-medium text-slate-600">
            Resolución / Norma específica:
          </span>{" "}
          <span>{report.resolucion}</span>
        </div>
      )}
      {report.formatoEnvio && (
        <div>
          <span className="font-medium text-slate-600">
            Formato requerido / de envío:
          </span>{" "}
          <span>{report.formatoEnvio}</span>
        </div>
      )}
      {report.linkInstructivo && (
        <div>
          <span className="font-medium text-slate-600">
            Link a instructivo:
          </span>{" "}
          <a
            href={report.linkInstructivo}
            target="_blank"
            rel="noreferrer"
            className="text-sky-600 hover:underline"
          >
            {report.linkInstructivo}
          </a>
        </div>
      )}
      {report.telefonoResponsable && (
        <div>
          <span className="font-medium text-slate-600">Teléfono:</span>{" "}
          <span>{report.telefonoResponsable}</span>
        </div>
      )}
      {report.correosNotificacion && (
        <div className="col-span-2">
          <span className="font-medium text-slate-600">
            Correos de notificación:
          </span>{" "}
          <span>{report.correosNotificacion}</span>
        </div>
      )}
      {report.fechaInicio && (
        <div>
          <span className="font-medium text-slate-600">
            Fecha de inicio vigencia:
          </span>{" "}
          <span>{report.fechaInicio}</span>
        </div>
      )}
      {report.fechaFinVigencia && (
        <div>
          <span className="font-medium text-slate-600">
            Fecha de fin vigencia:
          </span>{" "}
          <span>{report.fechaFinVigencia}</span>
        </div>
      )}
      {(report.diaVencimiento ||
        report.mesVencimiento ||
        report.plazoAdicionalDias) && (
        <div className="col-span-2">
          <span className="font-medium text-slate-600">
            Parámetros de vencimiento:
          </span>{" "}
          <span className="text-slate-700">
            Día: {report.diaVencimiento || "-"} · Mes:{" "}
            {report.mesVencimiento || "-"} · Plazo adicional:{" "}
            {report.plazoAdicionalDias || 0} días
          </span>
        </div>
      )}

      {/* Histórico / periodos */}
      <div className="col-span-2 border-t border-slate-200 pt-3 mt-2">
        <PeriodosTable report={report} onUpdatePeriodo={onUpdatePeriodo} />
      </div>
    </div>
  );
}

// ---------------------------------------------
//       TABLA DE PERIODOS / SEGUIMIENTO
// ---------------------------------------------

function PeriodosTable({ report, onUpdatePeriodo }) {
  const periodos = report.periodos || [];

  if (!periodos.length) {
    return (
      <p className="text-slate-500">
        Este reporte aún no tiene periodos generados. Al crear nuevos reportes,
        los periodos se generan automáticamente según la frecuencia definida.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="font-semibold text-slate-800">
        Seguimiento del cumplimiento (periodos generados)
      </p>

      <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
        <table className="w-full text-[11px]">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
            <tr>
              <th className="py-1.5 px-2 text-left font-medium">
                Periodo
              </th>
              <th className="py-1.5 px-2 text-left font-medium">
                Fecha de vencimiento (calculada)
              </th>
              <th className="py-1.5 px-2 text-left font-medium">
                Estado seguimiento
              </th>
              <th className="py-1.5 px-2 text-left font-medium">
                Fecha y hora envío real
              </th>
              <th className="py-1.5 px-2 text-left font-medium">
                Reporte final (URL)
              </th>
              <th className="py-1.5 px-2 text-left font-medium">
                Evidencia envío (URL)
              </th>
              <th className="py-1.5 px-2 text-left font-medium">
                Comentarios / observaciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {periodos.map((p) => {
              const venc = p.fechaVencimiento
                ? formatDMY(p.fechaVencimiento)
                : "-";

              // Normalizar fecha/hora a formato aceptado por <input type="datetime-local">
              let fechaEnvioValue = "";
              if (p.fechaEnvioReal) {
                // si viene como ISO largo, recortamos a YYYY-MM-DDTHH:MM
                if (p.fechaEnvioReal.length >= 16) {
                  fechaEnvioValue = p.fechaEnvioReal.slice(0, 16);
                } else {
                  fechaEnvioValue = p.fechaEnvioReal;
                }
              }

              return (
                <tr key={p.id}>
                  <td className="py-1.5 px-2">{p.periodo}</td>
                  <td className="py-1.5 px-2">{venc}</td>
                  <td className="py-1.5 px-2">{p.estadoSeguimiento}</td>
                  <td className="py-1.5 px-2">
                    <input
                      type="datetime-local"
                      value={fechaEnvioValue}
                      onChange={(e) =>
                        onUpdatePeriodo(report.id, p.id, {
                          // guardamos el ISO local tal cual para que computeEstadoSeguimiento funcione
                          fechaEnvioReal: e.target.value,
                        })
                      }
                      className="w-full border rounded px-2 py-1"
                    />
                  </td>
                  <td className="py-1.5 px-2">
                    <input
                      type="url"
                      value={p.reporteFinalUrl || ""}
                      onChange={(e) =>
                        onUpdatePeriodo(report.id, p.id, {
                          reporteFinalUrl: e.target.value,
                        })
                      }
                      className="w-full border rounded px-2 py-1"
                      placeholder="URL del reporte final"
                    />
                  </td>
                  <td className="py-1.5 px-2">
                    <input
                      type="url"
                      value={p.evidenciaUrl || ""}
                      onChange={(e) =>
                        onUpdatePeriodo(report.id, p.id, {
                          evidenciaUrl: e.target.value,
                        })
                      }
                      className="w-full border rounded px-2 py-1"
                      placeholder="URL de evidencia (acuse, correo, etc.)"
                    />
                  </td>
                  <td className="py-1.5 px-2">
                    <input
                      type="text"
                      value={p.comentarios || ""}
                      onChange={(e) =>
                        onUpdatePeriodo(report.id, p.id, {
                          comentarios: e.target.value,
                        })
                      }
                      className="w-full border rounded px-2 py-1"
                      placeholder="Notas / comentarios"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------
//          MODAL CREAR / EDITAR REPORTE
// ---------------------------------------------

// Lista cerrada para Formato Requerido (Texto/Lista Cerrada)
const FORMATO_ENVIO_OPCIONES = [
  "PDF",
  "Excel",
  "Carga SUI",
  "Formulario web",
  "Otro",
];

function ReportModal({
  entities,
  form,
  onChange,
  onClose,
  onSave,
  isEditing,
}) {
  // Habilitar Mes de vencimiento solo para anual / trimestral
  const mesVencimientoHabilitado =
    form.frecuencia === "Anual" || form.frecuencia === "Trimestral";

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-sm font-semibold mb-4">
          {isEditing ? "Editar reporte" : "Crear nuevo reporte"}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">
              ID Reporte *
            </label>
            <input
              type="text"
              name="idReporte"
              value={form.idReporte}
              onChange={onChange}
              placeholder="Ej: REP001"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              Nombre del Reporte *
            </label>
            <input
              type="text"
              name="nombreReporte"
              value={form.nombreReporte}
              onChange={onChange}
              placeholder="Ej: Información Comercial"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="col-span-2">
            <label className="block font-medium mb-1">
              Entidad de Control *
            </label>
            <select
              name="entidadId"
              value={form.entidadId}
              onChange={onChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Selecciona una entidad…</option>
              {entities
                .filter((e) => e.status !== "Inactiva")
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.code} — {e.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block font-medium mb-1">Base Legal</label>
            <textarea
              name="baseLegal"
              value={form.baseLegal}
              onChange={onChange}
              placeholder="Normativas o leyes principales"
              className="w-full border rounded px-3 py-2 h-16"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              Resolución / Norma específica
            </label>
            <input
              type="text"
              name="resolucion"
              value={form.resolucion}
              onChange={onChange}
              placeholder="Ej: Resolución CREG XXX de AAAA"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              Formato requerido / de envío
            </label>
            <select
              name="formatoEnvio"
              value={form.formatoEnvio}
              onChange={onChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Selecciona un formato…</option>
              {FORMATO_ENVIO_OPCIONES.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block font-medium mb-1">
              Link a instructivo / guía
            </label>
            <input
              type="url"
              name="linkInstructivo"
              value={form.linkInstructivo}
              onChange={onChange}
              placeholder="Ej: https://intranet/manual-reporte"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              Fecha de Inicio Vigencia *
            </label>
            <input
              type="date"
              name="fechaInicio"
              value={form.fechaInicio}
              onChange={onChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              Fecha de Fin Vigencia (opcional)
            </label>
            <input
              type="date"
              name="fechaFinVigencia"
              value={form.fechaFinVigencia}
              onChange={onChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              Frecuencia
            </label>
            <select
              name="frecuencia"
              value={form.frecuencia}
              onChange={onChange}
              className="w-full border rounded px-3 py-2"
            >
              {FRECUENCIAS.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">
              Día de vencimiento
            </label>
            <input
              type="number"
              name="diaVencimiento"
              value={form.diaVencimiento}
              onChange={onChange}
              placeholder="Ej: 15"
              className="w-full border rounded px-3 py-2"
              min={1}
              max={31}
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              Mes de vencimiento (para anual / trimestral)
            </label>
            <select
              name="mesVencimiento"
              value={form.mesVencimiento}
              onChange={onChange}
              className="w-full border rounded px-3 py-2 disabled:bg-slate-100 disabled:text-slate-400"
              disabled={!mesVencimientoHabilitado}
            >
              <option value="">—</option>
              <option value="1">Enero</option>
              <option value="2">Febrero</option>
              <option value="3">Marzo</option>
              <option value="4">Abril</option>
              <option value="5">Mayo</option>
              <option value="6">Junio</option>
              <option value="7">Julio</option>
              <option value="8">Agosto</option>
              <option value="9">Septiembre</option>
              <option value="10">Octubre</option>
              <option value="11">Noviembre</option>
              <option value="12">Diciembre</option>
            </select>
            {!mesVencimientoHabilitado && (
              <p className="mt-1 text-[10px] text-slate-500">
                Solo aplica para reportes anuales o trimestrales.
              </p>
            )}
          </div>

          <div>
            <label className="block font-medium mb-1">
              Plazo adicional (días)
            </label>
            <input
              type="number"
              name="plazoAdicionalDias"
              value={form.plazoAdicionalDias}
              onChange={onChange}
              placeholder="Ej: 3"
              className="w-full border rounded px-3 py-2"
              min={0}
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              Responsable elaboración - Nombre
            </label>
            <input
              type="text"
              name="responsableElaboracionName"
              value={form.responsableElaboracionName}
              onChange={onChange}
              placeholder="Nombre completo"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              Responsable elaboración - CC
            </label>
            <input
              type="text"
              name="responsableElaboracionCC"
              value={form.responsableElaboracionCC}
              onChange={onChange}
              placeholder="Documento (solo números)"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              Responsable supervisión - Nombre
            </label>
            <input
              type="text"
              name="responsableSupervisionName"
              value={form.responsableSupervisionName}
              onChange={onChange}
              placeholder="Nombre completo"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              Responsable supervisión - CC
            </label>
            <input
              type="text"
              name="responsableSupervisionCC"
              value={form.responsableSupervisionCC}
              onChange={onChange}
              placeholder="Documento (solo números)"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              Teléfono del responsable
            </label>
            <input
              type="tel"
              name="telefonoResponsable"
              value={form.telefonoResponsable}
              onChange={onChange}
              placeholder="Ej: 3000000000"
              className="w-full border rounded px-3 py-2"
              pattern="\d*"
              inputMode="numeric"
            />
          </div>

          <div className="col-span-2">
            <label className="block font-medium mb-1">
              Correos de Notificación
            </label>
            <textarea
              name="correosNotificacion"
              value={form.correosNotificacion}
              onChange={onChange}
              placeholder="Lista de emails separada por comas"
              className="w-full border rounded px-3 py-2 h-16"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6 text-xs">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded font-medium hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            className="flex-1 px-4 py-2 bg-slate-900 text-white rounded font-medium hover:bg-slate-800"
          >
            {isEditing ? "Guardar cambios" : "Agregar reporte"}
          </button>
        </div>
      </div>
    </div>
  );
}


// ---------------------------------------------
//        COMPONENTES AUXILIARES (MÉTRICAS)
// ---------------------------------------------

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
      <LegendDot className="bg-emerald-500" label="Próximos" />
      <LegendDot className="bg-amber-500" label="Pendientes" />
      <LegendDot className="bg-red-500" label="Vencidos" />
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
