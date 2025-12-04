import React, { useMemo, useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logoLlanogas from "../assets/logo-llanogas.png";
import useAuth from "../hooks/useAuth";
import { generateAlertsFromReports } from "../utils/notifications";

const mainNav = [
  { to: "/dashboard", icon: "📊", label: "Dashboard" },
  { to: "/my-tasks", icon: "📋", label: "Mis tareas pendientes" },
  { to: "/reports", icon: "📁", label: "Reportes" },
  { to: "/entities", icon: "🏛️", label: "Entidades de control" },
  { to: "/calendar", icon: "📅", label: "Calendario" },
  { to: "/compliance", icon: "✅", label: "Cumplimiento" },
  { to: "/locations-map", icon: "🗺️", label: "Mapa de localizaciones" },
];

const adminNav = [
  { to: "/users", icon: "👥", label: "Usuarios y roles" },
  { to: "/settings", icon: "⚙️", label: "Configuración" },
];

// 🔐 qué rutas del menú puede ver cada rol
const ROLE_NAV_PERMISSIONS = {
  admin: [
    "/dashboard",
    "/my-tasks",
    "/reports",
    "/entities",
    "/calendar",
    "/compliance",
    "/locations-map",
    "/users",
    "/settings",
  ],
  responsable_reportes: [
    "/dashboard",
    "/my-tasks",
    "/reports",
    "/entities",
    "/calendar",
    "/compliance",
    "/locations-map",
  ],
  supervisor_cumplimiento: [
    "/dashboard",
    "/my-tasks",
    "/reports",
    "/entities",
    "/calendar",
    "/compliance",
    "/locations-map",
  ],
  consulta_auditoria: [
    "/dashboard",
    "/reports",
    "/entities",
    "/compliance",
    "/locations-map",
  ],
};

const MONTH_NAMES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

function SidebarNavItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-sm transition",
          isActive
            ? "bg-slate-100 text-slate-950 font-semibold shadow-inner"
            : "text-slate-300 hover:bg-slate-900/70 hover:text-white",
        ].join(" ")
      }
    >
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}

export default function MainLayout({ title, subtitle, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // 🔑 rol interno para permisos (id tipo "admin", "responsable_reportes", etc.)
  const roleId = user?.roleId || null;

  // helper para filtrar ítems de menú según rol
  const filterNavItems = (items) => {
    if (!roleId) return items; // si no hay rol, no escondemos nada (útil mientras conectas auth real)
    const allowed = ROLE_NAV_PERMISSIONS[roleId] || [];
    return items.filter((item) => allowed.includes(item.to));
  };

  const visibleMainNav = filterNavItems(mainNav);
  const visibleAdminNav = filterNavItems(adminNav);

  // ---------- período global ----------
  const [period, setPeriod] = useState(() => {
    const now = new Date();
    return { month: now.getMonth(), year: now.getFullYear() };
  });

  const periodLabel = useMemo(
    () => `${MONTH_NAMES[period.month]} ${period.year}`,
    [period]
  );

  const handlePrevPeriod = () => {
    setPeriod((prev) => {
      let month = prev.month - 1;
      let year = prev.year;
      if (month < 0) {
        month = 11;
        year -= 1;
      }
      return { month, year };
    });
  };

  const handleNextPeriod = () => {
    setPeriod((prev) => {
      let month = prev.month + 1;
      let year = prev.year;
      if (month > 11) {
        month = 0;
        year += 1;
      }
      return { month, year };
    });
  };

  // ---------- notificaciones basadas en reportes ----------
  const [showNotifications, setShowNotifications] = useState(false);

  const [notifications, setNotifications] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("notifications");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const rawReports = localStorage.getItem("reportesCreados");
      const reports = rawReports ? JSON.parse(rawReports) : [];

      const generated = generateAlertsFromReports(reports);

      setNotifications((prev) => {
        const readMap = Object.fromEntries(prev.map((n) => [n.id, n.read]));
        return generated.map((a) => ({
          ...a,
          read: readMap[a.id] ?? a.read ?? false,
        }));
      });
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("notifications", JSON.stringify(notifications));
    } catch {
      // ignore
    }
  }, [notifications]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationClick = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // ---------- usuario / avatar ----------
  const displayName = user?.email || "usuario@llanogas.com";
  const displayRole = user?.role || "";

  const initials = useMemo(() => {
    const base = (user?.name && user.name.trim()) || user?.email || "";
    if (!base) return "US";
    const cleaned = base.includes("@") ? base.split("@")[0] : base;
    const parts = cleaned.split(/[.\s_]+/).filter(Boolean);
    if (!parts.length) return cleaned.charAt(0).toUpperCase();
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0).toUpperCase() +
      parts[parts.length - 1].charAt(0).toUpperCase()
    );
  }, [user?.name, user?.email]);

  const handleLogout = () => {
    logout?.();
    navigate("/login", { replace: true });
  };

  const alertTypeClass = (type) => {
    switch (type) {
      case "Verde":
        return "border-emerald-100 bg-emerald-50/80";
      case "Amarilla":
        return "border-amber-100 bg-amber-50/80";
      case "Naranja":
        return "border-orange-100 bg-orange-50/80";
      case "Roja":
        return "border-red-100 bg-red-50/80";
      default:
        return "border-slate-100 bg-white";
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950/5">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-950 text-slate-100 flex flex-col shadow-2xl">
        <div className="px-6 pt-6 pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl overflow-hidden bg-slate-900 shadow-lg">
              <img
                src={logoLlanogas}
                alt="Logo Llanogas"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                LLANOGAS
              </h1>
              <p className="text-[11px] text-slate-400">
                Gestión de reportes regulatorios
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-5 text-sm space-y-6 overflow-y-auto">
          {visibleMainNav.length > 0 && (
            <div>
              <p className="px-2 text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-2">
                Navegación
              </p>
              {visibleMainNav.map((item) => (
                <SidebarNavItem key={item.to} {...item} />
              ))}
            </div>
          )}

          {visibleAdminNav.length > 0 && (
            <div>
              <p className="px-2 text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-2">
                Administración
              </p>
              {visibleAdminNav.map((item) => (
                <SidebarNavItem key={item.to} {...item} />
              ))}
            </div>
          )}
        </nav>

        {/* Footer sidebar con usuario */}
        <div className="px-5 py-4 border-t border-slate-800 bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold">
              {initials}
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold truncate">{displayName}</p>
              {displayRole && (
                <p className="text-[11px] text-slate-400 truncate">
                  {displayRole}
                </p>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="text-[11px] text-slate-400 hover:text-slate-200"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="relative z-30 h-16 bg-white/80 backdrop-blur border-b border-slate-200 px-6 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-1">
              Tablero ejecutivo
            </p>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            {subtitle && (
              <p className="text-xs text-slate-500">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-4 relative">
            {/* Selector de período */}
            <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-slate-200 bg-white">
              <button
                type="button"
                onClick={handlePrevPeriod}
                className="h-5 w-5 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500"
              >
                ‹
              </button>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Período: {periodLabel}</span>
              </span>
              <button
                type="button"
                onClick={handleNextPeriod}
                className="h-5 w-5 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500"
              >
                ›
              </button>
            </div>

            {/* Notificaciones */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications((v) => !v)}
                className="relative"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200">
                  🔔
                </span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-[10px] text-white font-semibold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl text-[11px] z-40">
                  <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-semibold text-slate-800">
                      Notificaciones
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">
                        {unreadCount} nuevas
                      </span>
                      {notifications.length > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="text-[10px] text-sky-500 hover:text-sky-600"
                        >
                          Marcar todas leídas
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="px-3 py-4 text-slate-500">
                        Aún no hay notificaciones. Cuando conectes el backend
                        aparecerán aquí los vencimientos, alertas y cambios de
                        configuración.
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => handleNotificationClick(n.id)}
                          className={[
                            "w-full text-left px-3 py-2 border-b border-slate-50 last:border-b-0 flex flex-col gap-0.5",
                            alertTypeClass(n.type),
                            n.read ? "opacity-70" : "opacity-100",
                          ].join(" ")}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900">
                              {n.nombre}
                            </span>
                            <span className="text-[10px] text-slate-600">
                              {n.type}
                            </span>
                          </div>
                          <p className="text-slate-700">{n.message}</p>
                          <p className="text-[10px] text-slate-500">
                            Vence: {n.fechaVencimiento} · Responsable:{" "}
                            {n.responsable}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-px bg-slate-200" />

            {/* Usuario en topbar */}
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-slate-900 text-slate-100 flex items-center justify-center text-xs font-semibold">
                {initials}
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-800 truncate">
                  {displayName}
                </p>
                {displayRole && (
                  <p className="text-slate-500 truncate">{displayRole}</p>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page body */}
        <section className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-slate-50 to-slate-100">
          {children}
        </section>
      </main>
    </div>
  );
}
