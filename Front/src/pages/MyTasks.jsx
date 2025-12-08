// src/pages/MyTasks.jsx
import React, { useMemo, useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";

/* ========= helpers compartidos con Reports.jsx ========= */
function parseDateString(dateStr) {
  if (!dateStr) return null;
  const iso = new Date(dateStr);
  if (!isNaN(iso)) return iso;
  const parts = String(dateStr).split("/");
  if (parts.length === 3) {
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const y = parseInt(parts[2], 10);
    const dObj = new Date(y, m, d);
    return isNaN(dObj) ? null : dObj;
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
  const step = freqMap[valid] ?? 1;

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
    return { lastDue: null, nextDue: current };
  }

  return { lastDue: current, nextDue: next };
}

function formatDate(d) {
  if (!d) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/* ========== lógica de estados (igual que en Reports.jsx) ========== */

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

function getExtendedDueDate(originalDueDate) {
  if (!originalDueDate) return null;
  const extended = new Date(originalDueDate);
  extended.setDate(extended.getDate() + 2);
  return extended;
}

/**
 * - "Dentro del plazo"  -> hoy <= due y SIN acuse
 * - "Pendiente"         -> due < hoy <= due+2 días y SIN acuse
 * - "Enviado a tiempo"  -> acuseDate <= due
 * - "Enviado tarde"     -> due < acuseDate <= due+2 días
 * - "Vencido"           -> hoy > due+2 días y SIN acuse, o acuse > due+2
 */
function getReportStatus(report, attachmentsMap, todayStart) {
  const parseMaybeDate = (val) =>
    val instanceof Date ? val : val ? parseDateString(val) : null;

  let due = parseMaybeDate(report.lastDue) || parseMaybeDate(report.nextDue);
  if (!due || isNaN(due)) return "Dentro del plazo";

  const extended = getExtendedDueDate(due);
  const acuseDate = getFirstAcuseDate(report.id, attachmentsMap);

  if (acuseDate) {
    if (acuseDate <= due) return "Enviado a tiempo";
    if (acuseDate > due && acuseDate <= extended) return "Enviado tarde";
    return "Vencido";
  }

  if (todayStart <= due) return "Dentro del plazo";
  if (todayStart > due && todayStart <= extended) return "Pendiente";

  return "Vencido";
}

/* ========= formulario base usado por el modal de CARGAR ========= */

const emptyForm = {
  idReporte: "",
  nombreReporte: "",
  entidadControl: "",
  baseLegal: "",
  informacionContenido: "",
  cargoResponsableEnvio: "",
  responsableElaboracionName: "",
  responsableElaboracionCC: "",
  responsableSupervisionName: "",
  responsableSupervisionCC: "",
  telefonoResponsable: "",
  frecuencia: "Mensual",
  correosNotificacion: "",
  emailResponsableEnvio: "",
  emailLiderSeguimiento: "",
  gerenciaResponsable: "",
  fechaInicio: "",
  fechaLimiteEnvio: "",
};

const PAGE_SIZE = 10;


/* =================== Página MyTasks =================== */

export default function MyTasks() {
  const { user, token } = useAuth();

  const [reportes, setReportes] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem("reportesCreados");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [attachmentsMap, setAttachmentsMap] = useState(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = window.localStorage.getItem("reportAttachments");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const [users, setUsers] = useState([]);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("todos");
  const [frecuenciaFilter, setFrecuenciaFilter] = useState("todas");

  // cargar reportes desde backend
  useEffect(() => {
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    const loadReports = async () => {
      try {
        const resp = await fetch("http://localhost:8080/api/reports", {
          headers: {
            ...authHeaders,
          },
        });
        if (!resp.ok) throw new Error("Error al cargar reportes");

        const data = await resp.json();
        const withSource = data.map((r) => ({
          ...r,
          source: r.source || "created",
        }));

        setReportes(withSource);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            "reportesCreados",
            JSON.stringify(withSource)
          );
        }
      } catch (err) {
        console.error("Error cargando reportes desde el servidor", err);
      }
    };

    loadReports();
  }, [token]);

  // cargar usuarios
  useEffect(() => {
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    const loadUsers = async () => {
      try {
        const resp = await fetch("http://localhost:8080/api/users", {
          headers: {
            ...authHeaders,
          },
        });
        console.log("Status /api/users:", resp.status);
        if (!resp.ok) throw new Error("Error al cargar usuarios");

        const data = await resp.json();
        console.log("Usuarios desde backend:", data);
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error cargando usuarios", err);
      }
    };

    loadUsers();
  }, [token]);

  // mapa rápido id → usuario
  const usersById = useMemo(() => {
    const map = {};
    users.forEach((u) => {
      if (u && u.id != null) {
        map[String(u.id)] = u;
      }
    });
    return map;
  }, [users]);

  // persistimos adjuntos
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        "reportAttachments",
        JSON.stringify(attachmentsMap)
      );
    } catch {
      
    }
  }, [attachmentsMap]);

  
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("reportesCreados", JSON.stringify(reportes));
    } catch {
      // ignore
    }
  }, [reportes]);

  // refrescar reportes si cambian en otra pestaña
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e) => {
      if (e.key === "reportesCreados") {
        try {
          const raw = e.newValue;
          setReportes(raw ? JSON.parse(raw) : []);
        } catch {
          
        }
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  if (!user) {
    return (
      <div className="rounded-2xl bg-white border border-slate-200 p-6 text-xs">
        <p className="text-sm font-semibold text-slate-900 mb-1">
          Mis Tareas Pendientes
        </p>
        <p className="text-[11px] text-slate-500">
          No hay usuario activo en sesión en el contexto de autenticación.
          Revisa la integración de <code>useAuth</code>.
        </p>
      </div>
    );
  }

  const fullName = user.name || user.fullName || user.email || "Usuario";
  const userId = user.id || user.userId || user.email;
  const roleId = user.roleId || user.role; // admin, responsable_reportes, etc.

  const userNameKey = (user.name || fullName).trim().toLowerCase();
  const userEmailKey = (user.email || "").trim().toLowerCase();
  const isAdmin = roleId === "admin";


  const basePendingReports = useMemo(() => {
    if (!reportes.length) return [];

    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    return reportes
      .map((rep) => {
        const dbId = rep.id; // ID real de BD (Long)
        const reportKey = String(dbId ?? rep.idReporte ?? rep.nombreReporte);

        // 1) fecha de referencia (solo fechaInicio vs hoy)
        let lastDue = null;
        let nextDue = null;

        if (rep.fechaInicio) {
          const startDate = parseDateString(rep.fechaInicio);
          if (startDate && !isNaN(startDate)) {
            lastDue = startDate;
          }
        }

        const enriched = {
          ...rep,
          id: reportKey,
          lastDue,
          nextDue, 
        };

        // 2) control de visibilidad por rol
        const assignedById =
          rep.responsableElaboracionUserId || rep.supervisorCumplimientoUserId;

        if (!isAdmin) {
          const isOwnerById =
            assignedById &&
            userId &&
            String(assignedById) === String(userId);

          const respElabName = (rep.responsableElaboracionName || "")
            .trim()
            .toLowerCase();
          const respSupName = (rep.responsableSupervisionName || "")
            .trim()
            .toLowerCase();
          const respElabEmail = (rep.emailResponsableEnvio || "")
            .trim()
            .toLowerCase();
          const respSupEmail = (rep.emailLiderSeguimiento || "")
            .trim()
            .toLowerCase();

          const isOwnerByIdentity =
            (userNameKey &&
              (userNameKey === respElabName ||
                userNameKey === respSupName)) ||
            (userEmailKey &&
              (userEmailKey === respElabEmail ||
                userEmailKey === respSupEmail));

          if (!isOwnerById && !isOwnerByIdentity) return null;
        }

        // 3) estado calculado global
        const statusLabel = getReportStatus(enriched, attachmentsMap, todayStart);

        // si ya hay al menos un acuse cargado, la tarea se considera cumplida
        const hasAcuse = !!getFirstAcuseDate(reportKey, attachmentsMap);

        const isClosed =
          hasAcuse ||
          statusLabel === "Enviado a tiempo" ||
          statusLabel === "Enviado tarde";

        if (isClosed) return null;

        // 4) fecha vencimiento real
        const dueDate =
          enriched.lastDue instanceof Date
            ? enriched.lastDue
            : enriched.lastDue
            ? parseDateString(enriched.lastDue)
            : null;

        if (!dueDate) return null;

        // 5) usuario asignado (para columna Usuario)
        let usuarioColumna = "-";
        let assignedUserId = assignedById || null;

        if (isAdmin) {
          if (assignedUserId != null) {
            const u = usersById[String(assignedUserId)];
            if (u) {
              usuarioColumna = u.name || u.email || `Usuario ${u.id}`;
            } else if (rep.responsableElaboracionName) {
              usuarioColumna = rep.responsableElaboracionName;
            } else if (rep.responsableSupervisionName) {
              usuarioColumna = rep.responsableSupervisionName;
            } else if (rep.emailResponsableEnvio) {
              usuarioColumna = rep.emailResponsableEnvio;
            } else if (rep.emailLiderSeguimiento) {
              usuarioColumna = rep.emailLiderSeguimiento;
            }
          } else {
            usuarioColumna = "Sin asignar";
          }
        } else {
          usuarioColumna = fullName;
          assignedUserId = userId;
        }

        // 6) estado para UI
        let estadoUI = "Pendiente";
        if (statusLabel === "Dentro del plazo") estadoUI = "Dentro del plazo";
        if (statusLabel === "Pendiente") estadoUI = "Pendiente";
        if (statusLabel === "Vencido") estadoUI = "Vencido";


        return {
          id: reportKey,
          dbId,
          titulo: rep.nombreReporte || rep.name || "Reporte sin nombre",
          report: enriched,
          usuario: usuarioColumna,
          assignedUserId,
          fechaVencimiento: dueDate.toISOString(),
          estado: estadoUI,
         
        };
      })
      .filter(Boolean)
      .sort((a, b) =>
        (a.fechaVencimiento || "").localeCompare(b.fechaVencimiento || "")
      );
  }, [
    reportes,
    attachmentsMap,
    usersById,
    userId,
    userNameKey,
    userEmailKey,
    isAdmin,
    fullName,
  ]);

  const pendingReports = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return basePendingReports.filter((r) => {
      const rep = r.report || {};

      const matchText =
        !term ||
        r.titulo.toLowerCase().includes(term) ||
        (rep.entidadControl || "").toLowerCase().includes(term) ||
        (rep.idReporte || "").toLowerCase().includes(term);

      if (!matchText) return false;

      const matchEstado =
        estadoFilter === "todos" || r.estado === estadoFilter;
      if (!matchEstado) return false;

      const freqNorm = validateFrequency(rep.frecuencia) || rep.frecuencia;
      const matchFreq =
        frecuenciaFilter === "todas" ||
        (freqNorm && freqNorm === frecuenciaFilter);

      if (!matchFreq) return false;

      return true;
    });
  }, [basePendingReports, searchTerm, estadoFilter, frecuenciaFilter]);

  // ========= paginación (10 tareas por página) =========
  const totalTasks = pendingReports.length;
  const totalPages = Math.max(1, Math.ceil(totalTasks / PAGE_SIZE));
  const [currentPage, setCurrentPage] = useState(1);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageItems = pendingReports.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  /* === Tendencia histórica de cumplimientos (todas las obligaciones) === */
  const statusStats = useMemo(() => {
    if (!reportes.length) return { total: 0, data: [] };

    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const counts = {
      "Enviado a tiempo": 0,
      "Enviado tarde": 0,
      "Dentro del plazo": 0,
      Pendiente: 0,
      Vencido: 0,
    };

    reportes.forEach((rep) => {
      const dbId = rep.id;
      const reportKey = String(dbId ?? rep.idReporte ?? rep.nombreReporte);

      let lastDue = null;
      let nextDue = null;
      if (rep.fechaInicio) {
        const startDate = parseDateString(rep.fechaInicio);
        if (startDate && !isNaN(startDate)) {
          lastDue = startDate;
        }
      }

      const enriched = {
        ...rep,
        id: reportKey,
        lastDue,
        nextDue,
      };

      const status = getReportStatus(enriched, attachmentsMap, todayStart);

      if (counts[status] === undefined) {
        counts[status] = 0;
      }
      counts[status] += 1;
    });

    const total = Object.values(counts).reduce((acc, v) => acc + v, 0);

    const data = Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([status, count]) => ({
        status,
        count,
        percent: total ? Math.round((count / total) * 100) : 0,
      }));

    return { total, data };
  }, [reportes, attachmentsMap]);

  /* ===== Modal Cargar reporte (sube acuse y evidencia) ===== */

  const [showModal, setShowModal] = useState(false);
  const [uploadTarget, setUploadTarget] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [uploadFile, setUploadFile] = useState(null);

  const handleOpenUpload = (task) => {
    const rep = task.report || {};

    setUploadTarget(task);
    setEditForm({
      idReporte: rep.idReporte || rep.id || "",
      nombreReporte: rep.nombreReporte || rep.name || "",
      entidadControl: rep.entidadControl || "",
      baseLegal: rep.baseLegal || "",
      informacionContenido: rep.informacionContenido || "",
      cargoResponsableEnvio: rep.cargoResponsableEnvio || "",
      responsableElaboracionName: rep.responsableElaboracionName || "",
      responsableElaboracionCC: rep.responsableElaboracionCC || "",
      responsableSupervisionName: rep.responsableSupervisionName || "",
      responsableSupervisionCC: rep.responsableSupervisionCC || "",
      telefonoResponsable: rep.telefonoResponsable || "",
      frecuencia: rep.frecuencia || "Mensual",
      correosNotificacion: rep.correosNotificacion || "",
      emailResponsableEnvio: rep.emailResponsableEnvio || "",
      emailLiderSeguimiento: rep.emailLiderSeguimiento || "",
      gerenciaResponsable: rep.gerenciaResponsable || "",
      fechaInicio: rep.fechaInicio || "",
      fechaLimiteEnvio: rep.fechaLimiteEnvio || "",
    });
    setUploadFile(null);
    setShowModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    setUploadFile(file || null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setUploadTarget(null);
    setEditForm(emptyForm);
    setUploadFile(null);
  };

  // ======= Función para que el ADMIN asigne usuario a un reporte =======
  const handleAssignUser = async (task, newUserIdRaw) => {
    if (!isAdmin) return;
    const newUserId = newUserIdRaw ? Number(newUserIdRaw) : null;

    const rep = task.report || {};
    const dbId = task.dbId ?? rep.id;
    if (!dbId) {
      console.error("No se encontró id de BD para el reporte", task);
      alert("No se encontró el identificador del reporte en el servidor.");
      return;
    }

    const backendPayload = {
      id: dbId,
      idReporte: rep.idReporte,
      nombreReporte: rep.nombreReporte,
      entidadControl: rep.entidadControl,
      informacionContenido: rep.informacionContenido,
      frecuencia: rep.frecuencia,
      cargoResponsableEnvio: rep.cargoResponsableEnvio,
      responsableElaboracionName: rep.responsableElaboracionName,
      responsableElaboracionCC: rep.responsableElaboracionCC,
      responsableSupervisionName: rep.responsableSupervisionName,
      responsableSupervisionCC: rep.responsableSupervisionCC,
      telefonoResponsable: rep.telefonoResponsable,
      correosNotificacion: rep.correosNotificacion,
      emailResponsableEnvio: rep.emailResponsableEnvio,
      emailLiderSeguimiento: rep.emailLiderSeguimiento,
      gerenciaResponsable: rep.gerenciaResponsable,
      baseLegal: rep.baseLegal,
      fechaInicio: rep.fechaInicio,
      fechaLimiteEnvio: rep.fechaLimiteEnvio,
      responsableElaboracionUserId: newUserId,
      supervisorCumplimientoUserId: rep.supervisorCumplimientoUserId || null,
    };

    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const resp = await fetch(`http://localhost:8080/api/reports/${dbId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify(backendPayload),
      });

      if (!resp.ok) {
        console.error("Error al asignar usuario en backend", resp.status);
        alert("Error al asignar el reporte al usuario.");
        return;
      }

      setReportes((prev) =>
        prev.map((r) =>
          String(r.id) === String(dbId)
            ? {
                ...r,
                ...backendPayload,
              }
            : r
        )
      );
    } catch (err) {
      console.error("Error de conexión al asignar usuario", err);
      alert("Error de conexión al asignar el reporte.");
    }
  };

  
  const handleGuardarCarga = async () => {
    if (!uploadTarget) return;

    const dbId = uploadTarget.dbId ?? uploadTarget.report?.id;

    if (!dbId) {
      console.error("No se encontró id de BD para el reporte", uploadTarget);
      alert("No se encontró el identificador del reporte en el servidor.");
      return;
    }

    const backendPayload = {
      id: dbId,
      idReporte: editForm.idReporte,
      nombreReporte: editForm.nombreReporte,
      entidadControl: editForm.entidadControl,
      informacionContenido: editForm.informacionContenido,
      frecuencia: validateFrequency(editForm.frecuencia) || "Mensual",
      cargoResponsableEnvio: editForm.cargoResponsableEnvio,
      responsableElaboracionName: editForm.responsableElaboracionName,
      responsableElaboracionCC: editForm.responsableElaboracionCC,
      responsableSupervisionName: editForm.responsableSupervisionName,
      responsableSupervisionCC: editForm.responsableSupervisionCC,
      telefonoResponsable: editForm.telefonoResponsable,
      correosNotificacion: editForm.correosNotificacion,
      emailResponsableEnvio: editForm.emailResponsableEnvio,
      emailLiderSeguimiento: editForm.emailLiderSeguimiento,
      gerenciaResponsable: editForm.gerenciaResponsable,
      baseLegal: editForm.baseLegal,
      fechaInicio: editForm.fechaInicio || null,
      fechaLimiteEnvio: editForm.fechaLimiteEnvio || null,
      responsableElaboracionUserId:
        uploadTarget.report?.responsableElaboracionUserId || null,
      supervisorCumplimientoUserId:
        uploadTarget.report?.supervisorCumplimientoUserId || null,
    };

    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const resp = await fetch(`http://localhost:8080/api/reports/${dbId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify(backendPayload),
      });

      if (!resp.ok) {
        console.error("Error al actualizar reporte en backend", resp.status);
        alert("Error al actualizar el reporte en el servidor.");
        return;
      }

      setReportes((prev) =>
        prev.map((r) => {
          if (String(r.id) !== String(dbId)) return r;
          return {
            ...r,
            ...backendPayload,
          };
        })
      );
    } catch (err) {
      console.error("Error al guardar carga", err);
      alert("Error de conexión al guardar los cambios del reporte.");
      return;
    }

    handleCloseModal();
  };

  /* ====================== Render ====================== */

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white border border-slate-200 p-4 text-xs">
        <p className="text-sm font-semibold text-slate-900 mb-1">
          Mis Tareas Pendientes
        </p>
        <p className="text-[11px] text-slate-500">
          Obligaciones de reporte asignadas a{" "}
          <span className="font-medium text-slate-900">{fullName}</span> (ID
          usuario: {userId || "N/D"}). Como administrador podrás ver las
          obligaciones de todos los roles y asignarlas a usuarios.
        </p>
      </div>

      {/* Filtros */}
      <div className="rounded-2xl bg-white border border-slate-200 p-3 text-[11px] flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="block mb-1 text-slate-500">Buscar</label>
          <input
            type="text"
            placeholder="Nombre, entidad o ID reporte…"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>

        <div>
          <label className="block mb-1 text-slate-500">Estado</label>
          <select
            value={estadoFilter}
            onChange={(e) => {
              setEstadoFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <option value="todos">Todos</option>
            <option value="Dentro del plazo">Dentro del plazo</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Vencido">Vencido</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 text-slate-500">Frecuencia</label>
          <select
            value={frecuenciaFilter}
            onChange={(e) => {
              setFrecuenciaFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <option value="todas">Todas</option>
            <option value="Mensual">Mensual</option>
            <option value="Trimestral">Trimestral</option>
            <option value="Semestral">Semestral</option>
            <option value="Anual">Anual</option>
          </select>
        </div>
      </div>

      {/* Tabla de tareas */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="border-b border-slate-200 bg-slate-50/60 text-slate-500">
            <tr>
              <th className="py-2 pl-4 font-medium">Usuario</th>
              <th className="py-2 font-medium">Reporte / obligación</th>
              <th className="py-2 font-medium">Fecha de vencimiento</th>
              <th className="py-2 font-medium">Estado</th>
              <th className="py-2 pr-4 font-medium text-center">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {pageItems.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/70 text-slate-700">
                <td className="py-2.5 pl-4 pr-2 text-[11px]">
                  {isAdmin ? (
                    <select
                      value={r.assignedUserId ?? ""}
                      onChange={(e) => handleAssignUser(r, e.target.value)}
                      className="w-full rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300 hover:bg-slate-100 appearance-none"
                    >
                      <option value="">Sin asignar</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name || u.email || `Usuario ${u.id}`}
                        </option>
                      ))}
                    </select>
                  ) : (
                    r.usuario || "-"
                  )}
                </td>

                <td className="py-2.5 pr-2 text-[11px] font-medium">
                  {r.titulo}
                </td>

            

                <td className="py-2.5 pr-2 text-[11px]">
                  {r.fechaVencimiento
                    ? formatDate(new Date(r.fechaVencimiento))
                    : "—"}
                </td>

                <td className="py-2.5 pr-2 text-[11px]">
                  <StatusPill estado={r.estado} />
                </td>

                <td className="py-2.5 pr-4 text-center">
                  <button
                    onClick={() => handleOpenUpload(r)}
                    className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 h-8 text-[11px] font-medium text-white hover:bg-slate-800"
                  >
                    Cargar
                  </button>
                </td>
              </tr>
            ))}

            {pendingReports.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-6 text-center text-[11px] text-slate-500"
                >
                  No tienes tareas pendientes registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Paginación */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-[11px] text-slate-500">
          <span>
            Mostrando{" "}
            {totalTasks === 0
              ? "0"
              : `${startIndex + 1}-${Math.min(
                  startIndex + PAGE_SIZE,
                  totalTasks
                )}`}{" "}
            de {totalTasks} tareas
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
        </div>obligac
      </div>

      {/* Tabla de tendencia histórica de cumplimientos */}
      {statusStats.total > 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 p-4 text-[11px]">
          <p className="text-sm font-semibold text-slate-900 mb-2">
            Tendencia histórica de cumplimientos
          </p>
          <table className="w-full text-left">
            <thead className="border-b border-slate-200 bg-slate-50/60 text-slate-500">
              <tr>
                <th className="py-2 pl-3 font-medium">Estado</th>
                <th className="py-2 font-medium"># obligaciones</th>
                <th className="py-2 font-medium">% sobre el total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {statusStats.data.map((row) => (
                <tr key={row.status}>
                  <td className="py-2 pl-3">
                    <StatusPill estado={row.status} />
                  </td>
                  <td className="py-2">{row.count}</td>
                  <td className="py-2">{row.percent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal para CARGAR / EDITAR REPORTE */}
      {showModal && uploadTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={handleCloseModal}
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
                    Carga de reporte regulatorio
                  </p>
                  <h2 className="text-2xl font-semibold leading-snug">
                    Cargar / editar reporte
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
                    onClick={handleCloseModal}
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
                      value={editForm.idReporte}
                      onChange={handleEditChange}
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
                      value={editForm.nombreReporte}
                      onChange={handleEditChange}
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
                      value={editForm.entidadControl}
                      onChange={handleEditChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-[0.12em]">
                      Base legal
                    </label>
                    <textarea
                      name="baseLegal"
                      value={editForm.baseLegal}
                      onChange={handleEditChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs h-20 resize-none focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-[0.12em]">
                      Información / contenido
                    </label>
                    <textarea
                      name="informacionContenido"
                      value={editForm.informacionContenido}
                      onChange={handleEditChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs h-24 resize-none focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400"
                    />
                  </div>
                </div>

                {/* Columna derecha */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-[0.12em]">
                        Cargo resp. envío
                      </label>
                      <input
                        type="text"
                        name="cargoResponsableEnvio"
                        value={editForm.cargoResponsableEnvio}
                        onChange={handleEditChange}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-[0.12em]">
                        Teléfono responsable
                      </label>
                      <input
                        type="tel"
                        name="telefonoResponsable"
                        value={editForm.telefonoResponsable}
                        onChange={handleEditChange}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-[0.12em]">
                        Resp. elaboración - Nombre
                      </label>
                      <input
                        type="text"
                        name="responsableElaboracionName"
                        value={editForm.responsableElaboracionName}
                        onChange={handleEditChange}
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
                        value={editForm.responsableElaboracionCC}
                        onChange={handleEditChange}
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
                        value={editForm.responsableSupervisionName}
                        onChange={handleEditChange}
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
                        value={editForm.responsableSupervisionCC}
                        onChange={handleEditChange}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-[0.12em]">
                      Correos de notificación
                    </label>
                    <textarea
                      name="correosNotificacion"
                      value={editForm.correosNotificacion}
                      onChange={handleEditChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs h-20 resize-none focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-[0.12em]">
                        Email resp. envío
                      </label>
                      <input
                        type="email"
                        name="emailResponsableEnvio"
                        value={editForm.emailResponsableEnvio}
                        onChange={handleEditChange}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-[0.12em]">
                        Email líder seguimiento
                      </label>
                      <input
                        type="email"
                        name="emailLiderSeguimiento"
                        value={editForm.emailLiderSeguimiento}
                        onChange={handleEditChange}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-[0.12em]">
                      Gerencia responsable
                    </label>
                    <input
                      type="text"
                      name="gerenciaResponsable"
                      value={editForm.gerenciaResponsable}
                      onChange={handleEditChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400"
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
                        value={editForm.fechaInicio}
                        onChange={handleEditChange}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-[0.12em]">
                        Fecha límite de envío
                      </label>
                      <input
                        type="date"
                        name="fechaLimiteEnvio"
                        value={editForm.fechaLimiteEnvio}
                        onChange={handleEditChange}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1 uppercase tracking-[0.12em]">
                      Archivo de reporte / acuse
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="block w-full text-[11px] text-slate-700 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[11px] file:font-medium file:bg-slate-900 file:text-white hover:file:bg-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* FOOTER BOTONES */}
              <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-full border border-slate-300 bg-white text-[12px] font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarCarga}
                  className="px-5 py-2 rounded-full bg-slate-900 text-[12px] font-medium text-white shadow-sm hover:bg-slate-800"
                >
                  Guardar carga
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== pill de estado ===== */

function StatusPill({ estado }) {
  const map = {
    "Dentro del plazo": "bg-sky-100 text-sky-800",
    Pendiente: "bg-amber-100 text-amber-800",
    Vencido: "bg-red-100 text-red-800",
    "Enviado a tiempo": "bg-emerald-100 text-emerald-800",
    "Enviado tarde": "bg-orange-100 text-orange-800",
  };
  const cls = map[estado] || "bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium ${cls}`}
    >
      {estado}
    </span>
  );
}
