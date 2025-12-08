// src/pages/Calendar.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const STATUS_BADGE = {
  "Dentro del plazo": "bg-sky-50 text-sky-800",
  Pendiente: "bg-amber-50 text-amber-800",
  Vencido: "bg-red-50 text-red-700",
};

const CRIT_BADGE = {
  Crítica: "bg-red-100 text-red-800",
  Alta: "bg-amber-100 text-amber-800",
  Media: "bg-sky-100 text-sky-800",
  Baja: "bg-emerald-100 text-emerald-800",
};

// ===== Helpers de fechas / frecuencia =====

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

function parseDate(dateStr) {
  return new Date(dateStr);
}

function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

// Filtro de rango de tiempo
function isInRange(date, currentMonth, range) {
  const startMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  );

  if (range === "month") {
    return (
      date.getFullYear() === currentMonth.getFullYear() &&
      date.getMonth() === currentMonth.getMonth()
    );
  }

  if (range === "3months") {
    const end = new Date(startMonth.getFullYear(), startMonth.getMonth() + 3, 1);
    return date >= startMonth && date < end;
  }

  // "year"
  return date.getFullYear() === currentMonth.getFullYear();
}

// criticidad basada en días a la fecha de vencimiento (para badges, no filtro)
function criticidadFromDueDate(dueDate) {
  if (!dueDate) return "Baja";

  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const diffDays = Math.round(
    (dueDate.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays <= 30) return "Crítica";
  if (diffDays <= 180) return "Alta";
  if (diffDays <= 300) return "Media";
  return "Baja";
}

// helper de estado (Pendiente / Vencido / Dentro del plazo)
function getCalendarStatus(dueDate) {
  if (!dueDate) return "Dentro del plazo";

  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const due = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  const extended = new Date(due);
  extended.setDate(extended.getDate() + 2);

  if (todayStart <= due) return "Dentro del plazo";
  if (todayStart > due && todayStart <= extended) return "Pendiente";
  return "Vencido";
}

export default function Calendar() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const today = new Date();

  const [events, setEvents] = useState([]);

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(today);
  const [rangeFilter, setRangeFilter] = useState("month"); // month | 3months | year

  // filtros
  const [entityFilter, setEntityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [frequencyFilter, setFrequencyFilter] = useState("all");
  const [responsibleFilter, setResponsibleFilter] = useState("all");

  const monthLabel = currentMonth.toLocaleDateString("es-CO", {
    month: "long",
    year: "numeric",
  });

  // Usuario / rol para visibilidad
  const fullName = user?.name || user?.fullName || user?.email || "Usuario";
  const userId = user?.id || user?.userId || user?.email;
  const roleId = user?.roleId || user?.role;
  const isAdmin = roleId === "admin";
  const userNameKey = (user?.name || fullName).trim().toLowerCase();
  const userEmailKey = (user?.email || "").trim().toLowerCase();

  // Cargar reportes → eventos
  useEffect(() => {
    if (!user) return;

    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    const loadReportsForCalendar = async () => {
      try {
        const resp = await fetch("http://localhost:8080/api/reports", {
          headers: {
            ...authHeaders,
          },
        });
        if (!resp.ok) throw new Error("Error al cargar reportes para calendario");

        const data = await resp.json();

        const mapped = (Array.isArray(data) ? data : []).flatMap((rep) => {
          // 1) calcular fecha vencimiento
          let dueDate = null;

          if (rep.fechaLimiteEnvio) {
            dueDate = parseDateString(rep.fechaLimiteEnvio);
          } else if (rep.fechaInicio && rep.frecuencia) {
            const period = computePeriodDates(rep.fechaInicio, rep.frecuencia);
            dueDate = period.nextDue;
          }

          if (!dueDate || isNaN(dueDate)) return [];

          // 2) visibilidad por usuario (solo admin ve todo)
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

            if (!isOwnerById && !isOwnerByIdentity) {
              return [];
            }
          }

          // fijamos hora 23:59 local
          const due = new Date(
            dueDate.getFullYear(),
            dueDate.getMonth(),
            dueDate.getDate(),
            23,
            59,
            0
          );

          const criticality = criticidadFromDueDate(due);
          const status = getCalendarStatus(due);

          return [
            {
              id: rep.id,
              reportId: rep.id,
              datetime: due.toISOString(),
              title: rep.nombreReporte || rep.name || "Reporte sin nombre",
              entity: rep.entidadControl || "—",
              status,
              criticality,
              responsible:
                rep.responsableElaboracionName ||
                rep.emailResponsableEnvio ||
                "—",
              frequency: rep.frecuencia || "Mensual",
            },
          ];
        });

        setEvents(mapped);
      } catch (err) {
        console.error("Error cargando eventos de calendario", err);
      }
    };

    loadReportsForCalendar();
  }, [token, user, userId, isAdmin, userNameKey, userEmailKey]);

  // Opciones para filtros
  const entityOptions = useMemo(() => {
    const uniques = Array.from(new Set(events.map((e) => e.entity))).filter(
      Boolean
    );
    return uniques;
  }, [events]);

  const frequencyOptions = useMemo(() => {
    const uniques = Array.from(new Set(events.map((e) => e.frequency))).filter(
      Boolean
    );
    return uniques;
  }, [events]);

  const responsibleOptions = useMemo(() => {
    const uniques = Array.from(
      new Set(events.map((e) => e.responsible))
    ).filter(Boolean);
    return uniques;
  }, [events]);

  // Eventos filtrados
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const d = parseDate(e.datetime);

      if (!isInRange(d, currentMonth, rangeFilter)) return false;
      if (entityFilter !== "all" && e.entity !== entityFilter) return false;
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (frequencyFilter !== "all" && e.frequency !== frequencyFilter)
        return false;
      if (
        responsibleFilter !== "all" &&
        (e.responsible || "") !== responsibleFilter
      )
        return false;

      return true;
    });
  }, [
    events,
    currentMonth,
    rangeFilter,
    entityFilter,
    statusFilter,
    frequencyFilter,
    responsibleFilter,
  ]);

  // Días en la grilla
  const monthDays = useMemo(() => {
    const days = [];
    const startOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    );

    const startWeekDay = (startOfMonth.getDay() + 6) % 7; // lunes = 0
    const totalDays = endOfMonth.getDate();

    for (let i = 0; i < startWeekDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= totalDays; day++) {
      days.push(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      );
    }

    return days;
  }, [currentMonth]);

  // eventos por día
  const eventsByDay = useMemo(() => {
    const map = {};
    filteredEvents.forEach((e) => {
      const d = parseDate(e.datetime);
      const key = d.toISOString().slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return map;
  }, [filteredEvents]);

  const selectedKey = selectedDate.toISOString().slice(0, 10);
  const eventsForSelectedDay = eventsByDay[selectedKey] || [];

  // Próximos vencimientos
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return [...filteredEvents]
      .filter((e) => parseDate(e.datetime) >= now)
      .sort((a, b) => parseDate(a.datetime) - parseDate(b.datetime))
      .slice(0, 4);
  }, [filteredEvents]);

  // Métricas
  const metrics = useMemo(() => {
    const total = filteredEvents.length;
    const critical = filteredEvents.filter(
      (e) => e.criticality === "Crítica"
    ).length;
    const pending = filteredEvents.filter(
      (e) => e.status === "Pendiente"
    ).length;
    const thisWeek = filteredEvents.filter((e) => {
      const d = parseDate(e.datetime);
      const diffDays = (d - today) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 7;
    }).length;

    return { total, critical, pending, thisWeek };
  }, [filteredEvents, today]);

  // navegación de mes/año
  const handlePrevMonth = () => {
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const base = new Date(today.getFullYear(), today.getMonth(), 1);
    setCurrentMonth(base);
    setSelectedDate(today);
    setRangeFilter("month");
    setEntityFilter("all");
    setStatusFilter("all");
    setFrequencyFilter("all");
    setResponsibleFilter("all");
  };

  const handleChangeMonth = (e) => {
    const newMonth = Number(e.target.value);
    setCurrentMonth((m) => new Date(m.getFullYear(), newMonth, 1));
  };

  const handleChangeYear = (e) => {
    const newYear = Number(e.target.value);
    setCurrentMonth((m) => new Date(newYear, m.getMonth(), 1));
  };

  const goToReportDetail = (event) => {
    if (!event || !event.id) return;
    navigate(`/reports?reportId=${encodeURIComponent(event.id)}`);
  };

  if (!user) {
    return (
      <div className="rounded-2xl bg-white border border-slate-200 p-6 text-xs">
        <p className="text-sm font-semibold text-slate-900 mb-1">
          Calendario de vencimientos
        </p>
        <p className="text-[11px] text-slate-500">
          No hay usuario autenticado. Inicia sesión para ver tus obligaciones.
        </p>
      </div>
    );
  }


const yearOptions = useMemo(() => {
  // si no hay eventos todavía, damos un rango genérico ±5 años
  if (!events.length) {
    const base = today.getFullYear();
    return Array.from({ length: 11 }, (_, i) => base - 5 + i);
  }

  const years = events
    .map((e) => {
      const d = new Date(e.datetime);
      return isNaN(d) ? null : d.getFullYear();
    })
    .filter((y) => y !== null);

  if (!years.length) {
    const base = today.getFullYear();
    return Array.from({ length: 11 }, (_, i) => base - 5 + i);
  }

  const min = Math.min(...years);
  const max = Math.max(...years);

  const from = min - 1; // pequeño padding
  const to = max + 1;

  const arr = [];
  for (let y = from; y <= to; y++) arr.push(y);
  return arr;
}, [events, today]);

const monthOptions = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];


  return (
    <div className="space-y-4">
      {/* Barra de controles del calendario */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col gap-4">
        {/* fila izquierda: navegación + mes/año */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <button
            onClick={handlePrevMonth}
            className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50"
          >
            ‹
          </button>
          <button
            onClick={handleNextMonth}
            className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50"
          >
            ›
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-full border border-slate-200 text-xs hover:bg-slate-50"
          >
            Hoy
          </button>

          <select
            value={currentMonth.getMonth()}
            onChange={handleChangeMonth}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 capitalize"
          >
            {monthOptions.map((m, idx) => (
              <option key={m} value={idx}>
                {m}
              </option>
            ))}
          </select>

         <select
  value={currentMonth.getFullYear()}
  onChange={handleChangeYear}
  className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50"
>
  {yearOptions.map((y) => (
    <option key={y} value={y}>
      {y}
    </option>
  ))}
</select>


          <span className="text-sm font-semibold text-slate-900 capitalize ml-auto">
            {monthLabel}
          </span>
        </div>

        {/* fila filtros: grilla simétrica */}
        <div className="w-full">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div>
              <label className="block mb-1 text-[10px] text-slate-500">
                Rango
              </label>
              <select
                value={rangeFilter}
                onChange={(e) => setRangeFilter(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50"
              >
                <option value="month">Mes actual</option>
                <option value="3months">Próximos 3 meses</option>
                <option value="year">Año completo</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-[10px] text-slate-500">
                Entidad
              </label>
              <select
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50"
              >
                <option value="all">Todas las entidades</option>
                {entityOptions.map((ent) => (
                  <option key={ent} value={ent}>
                    {ent}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-[10px] text-slate-500">
                Estado
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50"
              >
                <option value="all">Todos los estados</option>
                {Object.keys(STATUS_BADGE).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-[10px] text-slate-500">
                Frecuencia
              </label>
              <select
                value={frequencyFilter}
                onChange={(e) => setFrequencyFilter(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50"
              >
                <option value="all">Todas las frecuencias</option>
                {frequencyOptions.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-[10px] text-slate-500">
                Responsable
              </label>
              <select
                value={responsibleFilter}
                onChange={(e) => setResponsibleFilter(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50"
              >
                <option value="all">Todos los responsables</option>
                {responsibleOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-500">
          {metrics.total} vencimientos en el periodo • {metrics.critical} críticos
          • {metrics.thisWeek} esta semana
        </div>
      </div>

      {/* Contenido principal: grilla + panel derecho */}
      <div className="grid lg:grid-cols-[2fr,1.6fr] gap-4">
        {/* Grilla de mes */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">
            Calendario mensual
          </h3>

          <div className="grid grid-cols-7 text-[11px] text-slate-500 mb-1">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
              <div key={d} className="py-1 text-center">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-xs">
            {monthDays.map((day, idx) => {
              if (!day) {
                return <div key={idx} className="h-24" />;
              }

              const key = day.toISOString().slice(0, 10);
              const dayEvents = eventsByDay[key] || [];
              const hasEvents = dayEvents.length > 0;
              const isToday = isSameDay(day, today);
              const isSelected = isSameDay(day, selectedDate);

              let dayStatus = null;
              if (hasEvents) {
                const hasOverdue = dayEvents.some((e) => e.status === "Vencido");
                const hasPending = dayEvents.some(
                  (e) => e.status === "Pendiente"
                );
                if (hasOverdue) dayStatus = "Vencido";
                else if (hasPending) dayStatus = "Pendiente";
                else dayStatus = "Dentro del plazo";
              }

              const dotColor =
                dayStatus === "Vencido"
                  ? isSelected
                    ? "bg-red-300"
                    : "bg-red-500"
                  : dayStatus === "Pendiente"
                  ? isSelected
                    ? "bg-amber-300"
                    : "bg-amber-500"
                  : dayStatus === "Dentro del plazo"
                  ? isSelected
                    ? "bg-sky-300"
                    : "bg-sky-500"
                  : "";

              return (
                <button
                  key={key}
                  onClick={() => setSelectedDate(day)}
                  className={[
                    "relative h-24 rounded-xl border text-left px-2 py-1 flex flex-col justify-between transition",
                    isSelected
                      ? "border-slate-900 bg-slate-900 text-white"
                      : isToday
                      ? "border-sky-500 bg-sky-50/60"
                      : "border-slate-200 bg-slate-50/40 hover:bg-slate-100",
                  ].join(" ")}
                >
                  <span className="text-[11px] font-semibold">
                    {day.getDate()}
                  </span>
                  <span className="text-[10px] opacity-70">
                    {day.toLocaleDateString("es-CO", {
                      month: "short",
                    })}
                  </span>
                  {hasEvents && (
                    <span
                      className={[
                        "absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full",
                        dotColor,
                      ].join(" ")}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel derecho */}
        <div className="space-y-4">
          {/* Agenda del día */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Agenda del día
                </h3>
                <p className="text-[11px] text-slate-500">
                  {selectedDate.toLocaleDateString("es-CO", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {eventsForSelectedDay.length === 0 ? (
              <p className="mt-3 text-[11px] text-slate-500">
                No hay vencimientos programados para este día bajo los filtros
                actuales.
              </p>
            ) : (
              <ul className="mt-3 space-y-3 text-[11px]">
                {eventsForSelectedDay
                  .slice()
                  .sort((a, b) => parseDate(a.datetime) - parseDate(b.datetime))
                  .map((e) => {
                    const d = parseDate(e.datetime);
                    const timeLabel = d.toLocaleTimeString("es-CO", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    return (
                      <li
                        key={e.id}
                        onClick={() => goToReportDetail(e)}
                        className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 cursor-pointer hover:bg-slate-100"
                      >
                        <div className="mt-0.5 text-[11px] text-slate-500 min-w-[44px]">
                          {timeLabel}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800">
                            {e.title}
                          </p>
                          <p className="text-slate-500">
                            Entidad: {e.entity} · Responsable:{" "}
                            {e.responsible || "—"}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            <span
                              className={[
                                "inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium",
                                STATUS_BADGE[e.status] ||
                                  "bg-slate-100 text-slate-700",
                              ].join(" ")}
                            >
                              {e.status}
                            </span>
                            {e.frequency && (
                              <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                                Frecuencia: {e.frequency}
                              </span>
                            )}
                            <span
                              className={[
                                "inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium",
                                CRIT_BADGE[e.criticality] ||
                                  "bg-slate-100 text-slate-700",
                              ].join(" ")}
                            >
                              Criticidad: {e.criticality}
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
              </ul>
            )}
          </div>

          {/* Próximos vencimientos */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">
              Próximos vencimientos
            </h3>
            {upcomingEvents.length === 0 ? (
              <p className="text-[11px] text-slate-500">
                No hay vencimientos próximos bajo los filtros actuales.
              </p>
            ) : (
              <ul className="space-y-2 text-[11px]">
                {upcomingEvents.map((e) => {
                  const d = parseDate(e.datetime);
                  const dateLabel = d.toLocaleDateString("es-CO", {
                    day: "2-digit",
                    month: "short",
                  });
                  const timeLabel = d.toLocaleTimeString("es-CO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  return (
                    <li
                      key={e.id}
                      onClick={() => goToReportDetail(e)}
                      className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 cursor-pointer hover:bg-slate-100"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">
                          {e.title}
                        </p>
                        <p className="text-slate-500">
                          {dateLabel} · {timeLabel} · {e.entity}
                        </p>
                        <p className="text-slate-500 mt-0.5">
                          Criticidad:{" "}
                          <span
                            className={[
                              "inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium",
                              CRIT_BADGE[e.criticality] ||
                                "bg-slate-100 text-slate-700",
                            ].join(" ")}
                          >
                            {e.criticality}
                          </span>
                        </p>
                      </div>
                      <span
                        className={[
                          "inline-flex px-2.5 py-1 rounded-full text-[10px] font-medium",
                          STATUS_BADGE[e.status] ||
                            "bg-slate-100 text-slate-700",
                        ].join(" ")}
                      >
                        {e.status}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Métricas */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">
              Resumen del periodo
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <MetricCard label="Total vencimientos" value={metrics.total} />
              <MetricCard label="Críticos" value={metrics.critical} />
              <MetricCard label="Pendientes" value={metrics.pending} />
              <MetricCard label="Esta semana" value={metrics.thisWeek} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Componentes auxiliares */

function MetricCard({ label, value }) {
  return (
    <div className="border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/60">
      <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500 mb-1">
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
