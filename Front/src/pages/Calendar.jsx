// src/pages/Calendar.jsx
import React, { useMemo, useState } from "react";

const STATUS_BADGE = {
  "En proceso": "bg-amber-50 text-amber-800",
  Pendiente: "bg-red-50 text-red-700",
  "En elaboración": "bg-sky-50 text-sky-800",
  "En revisión interna": "bg-indigo-50 text-indigo-800",
  Enviado: "bg-emerald-50 text-emerald-800",
};

const CRIT_BADGE = {
  Alto: "bg-red-100 text-red-800",
  Medio: "bg-amber-100 text-amber-800",
  Bajo: "bg-emerald-100 text-emerald-800",
};

const ROLE_OPTIONS = [
  "Administrador del sistema",
  "Supervisor de cumplimiento",
  "Responsable de los reportes",
  "Usuario de consulta / Auditoría",
];

// Utils
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

export default function Calendar() {
  const today = new Date();

  /**
   * 👉 Cuando conectes backend, cada evento debería venir más o menos así:
   * {
   *   id: 'SUI-T1-2025-01',
   *   datetime: '2025-01-15T23:59:00',
   *   title: 'SUI - Reporte T1',
   *   entity: 'SUI',
   *   status: 'Pendiente' | 'En elaboración' | 'Enviado' | ...,
   *   criticality: 'Alto' | 'Medio' | 'Bajo',
   *   responsible: 'Juan Pérez',
   *   roleView: 'Responsable de los reportes',
   *   frequency: 'Mensual' | 'Trimestral' | 'Anual',
   * }
   */
  const [events] = useState([]); // TODO: poblar desde API

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(today);
  const [rangeFilter, setRangeFilter] = useState("month"); // month | 3months | year

  // filtros por campos del evento
  const [entityFilter, setEntityFilter] = useState("all"); // all | <entity>
  const [roleFilter, setRoleFilter] = useState("all"); // all | role
  const [statusFilter, setStatusFilter] = useState("all"); // all | status
  const [frequencyFilter, setFrequencyFilter] = useState("all"); // all | Mensual | ...
  const [responsibleFilter, setResponsibleFilter] = useState("all"); // all | nombre
  const [criticalityFilter, setCriticalityFilter] = useState("all"); // all | Alto | Medio | Bajo

  const [selectedEvent, setSelectedEvent] = useState(null);

  const monthLabel = currentMonth.toLocaleDateString("es-CO", {
    month: "long",
    year: "numeric",
  });

  // Entidades disponibles según los eventos
  const entityOptions = useMemo(() => {
    const uniques = Array.from(new Set(events.map((e) => e.entity))).filter(
      Boolean
    );
    return uniques;
  }, [events]);

  // Roles disponibles (por si quieres derivarlos desde backend)
  const availableRoles = useMemo(() => {
    const uniques = Array.from(new Set(events.map((e) => e.roleView))).filter(
      Boolean
    );
    return uniques.length ? uniques : ROLE_OPTIONS;
  }, [events]);

  // Frecuencias disponibles
  const frequencyOptions = useMemo(() => {
    const uniques = Array.from(new Set(events.map((e) => e.frequency))).filter(
      Boolean
    );
    return uniques;
  }, [events]);

  // Responsables disponibles
  const responsibleOptions = useMemo(() => {
    const uniques = Array.from(
      new Set(events.map((e) => e.responsible))
    ).filter(Boolean);
    return uniques;
  }, [events]);

  // Criticidades disponibles (si backend trae otras, se agregan)
  const criticalityOptions = useMemo(() => {
    const uniques = Array.from(
      new Set(events.map((e) => e.criticality))
    ).filter(Boolean);
    // baseline
    const base = ["Alto", "Medio", "Bajo"];
    const extra = uniques.filter((u) => !base.includes(u));
    return [...base, ...extra];
  }, [events]);

  // Eventos filtrados por rango / entidad / rol / estado / frecuencia / responsable / criticidad
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const d = parseDate(e.datetime);

      if (!isInRange(d, currentMonth, rangeFilter)) return false;
      if (entityFilter !== "all" && e.entity !== entityFilter) return false;
      if (roleFilter !== "all" && e.roleView !== roleFilter) return false;
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (frequencyFilter !== "all" && e.frequency !== frequencyFilter)
        return false;
      if (
        responsibleFilter !== "all" &&
        (e.responsible || "") !== responsibleFilter
      )
        return false;
      if (
        criticalityFilter !== "all" &&
        (e.criticality || "") !== criticalityFilter
      )
        return false;

      return true;
    });
  }, [
    events,
    currentMonth,
    rangeFilter,
    entityFilter,
    roleFilter,
    statusFilter,
    frequencyFilter,
    responsibleFilter,
    criticalityFilter,
  ]);

  // Días a mostrar en la grilla del mes
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

  // Eventos por día (con filtros aplicados)
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

  // Próximos vencimientos (filtrados)
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return [...filteredEvents]
      .filter((e) => parseDate(e.datetime) >= now)
      .sort((a, b) => parseDate(a.datetime) - parseDate(b.datetime))
      .slice(0, 4);
  }, [filteredEvents]);

  // Métricas del periodo (sobre eventos filtrados)
  const metrics = useMemo(() => {
    const total = filteredEvents.length;
    const critical = filteredEvents.filter(
      (e) => e.criticality === "Alto"
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
    setRoleFilter("all");
    setStatusFilter("all");
    setFrequencyFilter("all");
    setResponsibleFilter("all");
    setCriticalityFilter("all");
  };

  return (
    <div className="space-y-4">
      {/* Barra de controles del calendario */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs">
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
          <span className="text-sm font-semibold text-slate-900 capitalize">
            {monthLabel}
          </span>
        </div>

        <div className="flex flex-wrap gap-3 text-xs">
          <select
            value={rangeFilter}
            onChange={(e) => setRangeFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50"
          >
            <option value="month">Mes actual</option>
            <option value="3months">Próximos 3 meses</option>
            <option value="year">Año completo</option>
          </select>

          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50"
          >
            <option value="all">Todas las entidades</option>
            {entityOptions.map((ent) => (
              <option key={ent} value={ent}>
                {ent}
              </option>
            ))}
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50"
          >
            <option value="all">Todos los roles</option>
            {availableRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50"
          >
            <option value="all">Todos los estados</option>
            {Object.keys(STATUS_BADGE).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={frequencyFilter}
            onChange={(e) => setFrequencyFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50"
          >
            <option value="all">Todas las frecuencias</option>
            {frequencyOptions.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          <select
            value={responsibleFilter}
            onChange={(e) => setResponsibleFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50"
          >
            <option value="all">Todos los responsables</option>
            {responsibleOptions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <select
            value={criticalityFilter}
            onChange={(e) => setCriticalityFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50"
          >
            <option value="all">Todas las criticidades</option>
            {criticalityOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
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
                return <div key={idx} className="h-16" />;
              }

              const key = day.toISOString().slice(0, 10);
              const hasEvents = !!eventsByDay[key];
              const isToday = isSameDay(day, today);
              const isSelected = isSameDay(day, selectedDate);

              return (
                <button
                  key={key}
                  onClick={() => setSelectedDate(day)}
                  className={[
                    "relative h-16 rounded-xl border text-left px-2 py-1 flex flex-col justify-between transition",
                    isSelected
                      ? "border-slate-900 bg-slate-900 text-white"
                      : isToday
                      ? "border-emerald-500 bg-emerald-50/60"
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
                        isSelected ? "bg-emerald-300" : "bg-emerald-500",
                      ].join(" ")}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel derecho: agenda + próximos + métricas + detalle */}
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
                        onClick={() => setSelectedEvent(e)}
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
                      onClick={() => setSelectedEvent(e)}
                      className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 cursor-pointer hover:bg-slate-100"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">
                          {e.title}
                        </p>
                        <p className="text-slate-500">
                          {dateLabel} · {timeLabel} · {e.entity}
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

          {/* Métricas del periodo */}
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

          {/* Detalle emergente del evento (panel) */}
          {selectedEvent && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Detalle del vencimiento
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Vista personalizada para:{" "}
                    {selectedEvent.roleView || "—"}
                  </p>
                </div>
                <button
                  className="text-[11px] text-slate-400 hover:text-slate-600"
                  onClick={() => setSelectedEvent(null)}
                >
                  Cerrar
                </button>
              </div>

              <div className="mt-3 space-y-1 text-[11px] text-slate-700">
                <p>
                  <span className="font-semibold">Reporte:</span>{" "}
                  {selectedEvent.title}
                </p>
                <p>
                  <span className="font-semibold">Entidad:</span>{" "}
                  {selectedEvent.entity}
                </p>
                <p>
                  <span className="font-semibold">Responsable:</span>{" "}
                  {selectedEvent.responsible || "—"}
                </p>
                <p>
                  <span className="font-semibold">Estado:</span>{" "}
                  {selectedEvent.status}
                </p>
                <p>
                  <span className="font-semibold">Frecuencia:</span>{" "}
                  {selectedEvent.frequency || "—"}
                </p>
                <p>
                  <span className="font-semibold">Criticidad:</span>{" "}
                  {selectedEvent.criticality || "—"}
                </p>
                <p>
                  <span className="font-semibold">Fecha y hora:</span>{" "}
                  {parseDate(selectedEvent.datetime).toLocaleString("es-CO")}
                </p>
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-full border border-slate-200 text-[11px] hover:bg-slate-50"
                  // Aquí luego puedes hacer navigate(`/reports?reportId=${selectedEvent.reportId}`)
                >
                  Ver detalle del reporte
                </button>
              </div>
            </div>
          )}
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
