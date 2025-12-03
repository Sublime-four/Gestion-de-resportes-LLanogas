// src/layouts/MainLayout.jsx
import React, { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logoLlanogas from "../assets/logo-llanogas.png";
import useAuth from "../hooks/useAuth";

const mainNav = [
  { to: "/dashboard", icon: "📊", label: "Dashboard" },
  { to: "/reports", icon: "📁", label: "Reportes" },
  { to: "/calendar", icon: "📅", label: "Calendario" },
  { to: "/compliance", icon: "✅", label: "Cumplimiento" },
  { to: "/locations-map", icon: "🗺️", label: "Mapa de localizaciones" },
];

const adminNav = [
  { to: "/users", icon: "👥", label: "Usuarios y roles" },
  { to: "/settings", icon: "⚙️", label: "Configuración" },
];

// nombres de meses para mostrar el label
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

  // ---- estado de período global (mes / año) ----
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
    // aquí luego puedes disparar un fetch global por período
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
    // idem: fetch de datos por nuevo período
  };

  // ---- notificaciones (placeholder backend-ready) ----
  const [showNotifications, setShowNotifications] = useState(false);
  const notifications = []; // reemplaza por datos del backend
  const unreadCount = notifications.filter((n) => !n.read).length;

  const displayName = user?.name || "Usuario";
  const displayRole = user?.role || "Perfil no asignado";

  const initials = useMemo(() => {
    if (!user?.name) return "US";
    const parts = user.name.split(" ").filter(Boolean);
    if (!parts.length) return "US";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0).toUpperCase() +
      parts[parts.length - 1].charAt(0).toUpperCase()
    );
  }, [user?.name]);

  const handleLogout = () => {
    logout?.();
    navigate("/login", { replace: true });
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
          <div>
            <p className="px-2 text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-2">
              Navegación
            </p>
            {mainNav.map((item) => (
              <SidebarNavItem key={item.to} {...item} />
            ))}
          </div>

          <div>
            <p className="px-2 text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-2">
              Administración
            </p>
            {adminNav.map((item) => (
              <SidebarNavItem key={item.to} {...item} />
            ))}
          </div>
        </nav>

        <div className="px-5 py-4 border-t border-slate-800 bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold">
              {initials}
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold truncate">{displayName}</p>
              <p className="text-[11px] text-slate-400 truncate">
                {displayRole}
              </p>
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
        <header className="h-16 bg-white/80 backdrop-blur border-b border-slate-200 px-6 flex items-center justify-between">
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
            {/* Selector de período: todos los meses con prev / next */}
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
                <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white shadow-xl text-[11px] z-20">
                  <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-semibold text-slate-800">
                      Notificaciones
                    </span>
                    <span className="text-slate-400">
                      {unreadCount} nuevas
                    </span>
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
                        <div
                          key={n.id}
                          className="px-3 py-2 border-b border-slate-50 last:border-b-0 hover:bg-slate-50"
                        >
                          <p className="font-medium text-slate-800">
                            {n.title}
                          </p>
                          {n.body && (
                            <p className="text-slate-500">{n.body}</p>
                          )}
                          {n.time && (
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {n.time}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-px bg-slate-200" />

            {/* Usuario */}
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-slate-900 text-slate-100 flex items-center justify-center text-xs font-semibold">
                {initials}
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-800 truncate">
                  {displayName}
                </p>
                <p className="text-slate-500 truncate">{displayRole}</p>
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
