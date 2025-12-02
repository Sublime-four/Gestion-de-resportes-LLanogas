// src/layouts/MainLayout.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import logoLlanogas from "../assets/logo-llanogas.png";

const mainNav = [
  { to: "/dashboard", icon: "📊", label: "Dashboard" },
  { to: "/reports", icon: "📁", label: "Reportes" },
  { to: "/calendar", icon: "📅", label: "Calendario" },
  { to: "/compliance", icon: "✅", label: "Cumplimiento" },
];

const adminNav = [
  { to: "/users", icon: "👥", label: "Usuarios y roles" },
  { to: "/settings", icon: "⚙️", label: "Configuración" },
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
              YP
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold">Yohan Piñarte</p>
              <p className="text-[11px] text-slate-400">
                Responsable de reportes
              </p>
            </div>
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
          <div className="flex items-center gap-4">
            <button className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Período: Dic 2025</span>
            </button>

            <button className="relative">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200">
                🔔
              </span>
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-[10px] text-white font-semibold">
                3
              </span>
            </button>

            <div className="h-8 w-px bg-slate-200" />

            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-slate-900 text-slate-100 flex items-center justify-center text-xs font-semibold">
                YP
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-800">Yohan Piñarte</p>
                <p className="text-slate-500">Ingeniería y Desarrollo</p>
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
