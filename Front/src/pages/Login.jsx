// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import logoLlanogas from "../assets/logo-llanogas.png";
import gasBg from "../assets/gas.jpg";

export default function Login() {
  const { login } = useAuth(); 
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      // delegamos toda la llamada al backend al AuthContext
      await login(email, password, { remember });

      // si no lanza error, navega al dashboard (o a donde venga en state)
      navigate(from, { replace: true });
    } catch (err) {
      console.error("[Login] error", err);
      setError(
        err?.message || "Error al iniciar sesión. Verifica tus credenciales."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center">
      {/* Contenedor principal */}
      <div className="w-full max-w-6xl h-[560px] lg:h-[600px] rounded-[32px] overflow-hidden bg-slate-900/80 border border-sky-500/10 shadow-[0_40px_140px_rgba(15,23,42,0.9)] backdrop-blur-xl flex">
        {/* Panel izquierdo: formulario */}
        <div className="w-full lg:w-[52%] h-full px-8 lg:px-10 py-8 flex flex-col text-slate-100">
          {/* “Barra de ventana” */}
          <div className="flex items-center gap-2 mb-6">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          </div>

          {/* Branding */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center overflow-hidden">
              <img
                src={logoLlanogas}
                alt="Llanogas"
                className="w-9 h-9 object-contain"
              />
            </div>
            <div>
              <p className="text-xs font-medium tracking-[0.22em] uppercase text-sky-300">
                LLANOGAS
              </p>
              <p className="text-[11px] text-slate-400">
                Plataforma de reportes regulatorios
              </p>
            </div>
          </div>

          {/* Título + copy */}
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-semibold text-slate-50 mb-2">
              Bienvenido de nuevo
            </h1>
            <p className="text-sm text-slate-400 max-w-md">
              Ingresa para gestionar el cumplimiento regulatorio, los
              vencimientos y el estado de los reportes en un solo panel.
            </p>
          </div>

          {/* Formulario */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4 text-xs flex-1 flex flex-col"
          >
            {/* Email */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-300">
                Correo corporativo
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 text-sm">
                  ✉
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-900/60 border border-slate-700/70 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-400 transition"
                  placeholder="usuario@llanogas.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-300">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 text-sm">
                  🔒
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 rounded-xl bg-slate-900/60 border border-slate-700/70 pl-9 pr-10 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-400 transition"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                {/* Remember me */}
                <label className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={() => setRemember((v) => !v)}
                    className="h-3.5 w-3.5 rounded border-slate-600 bg-slate-900/80 text-sky-500 focus:ring-sky-500"
                  />
                  <span>Recordarme en este equipo</span>
                </label>

                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-[11px] text-sky-400 hover:text-sky-300"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>

            {/* Error backend */}
            {error && (
              <div className="text-[11px] text-red-400 bg-red-950/40 border border-red-500/40 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            {/* Botón principal */}
            <button
              type="submit"
              disabled={loading}
              className="mt-4 h-10 w-full rounded-xl bg-sky-500 text-xs font-semibold text-white shadow-[0_14px_40px_rgba(56,189,248,0.45)] hover:bg-sky-400 transition disabled:opacity-70 disabled:cursor-wait"
            >
              {loading ? "Ingresando..." : "Entrar al panel"}
            </button>

            {/* Footer legal */}
            <div className="mt-4 text-[11px] text-slate-500">
              <p>Acceso exclusivo para usuarios internos.</p>
              <p className="mt-1">
                ¿Necesitas acceso? Visita{" "}
                <a
                  href="https://www.llanogas.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-400 hover:text-sky-300 underline underline-offset-2"
                >
                  www.llanogas.com
                </a>
                .
              </p>
            </div>
          </form>
        </div>

        {/* Panel derecho: imagen de gas + tarjetas de información */}
        <div className="hidden lg:block relative flex-1 group overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={gasBg}
              alt="Gas natural Llanogas"
              className="w-full h-full object-cover scale-110 transform transition-transform duration-[2500ms] group-hover:scale-125"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-sky-700/45 to-emerald-500/40 mix-blend-soft-light" />
            <div className="absolute -bottom-24 right-[-12%] w-[440px] h-[440px] rounded-full bg-sky-400/25 blur-3xl" />
          </div>

          <div className="relative z-10 h-full flex flex-col justify-between p-8 gap-4">
            <div className="max-w-sm rounded-2xl bg-slate-900/80 border border-sky-400/40 px-5 py-4 shadow-[0_22px_70px_rgba(15,23,42,0.95)] backdrop-blur-md">
              <p className="text-[10px] font-semibold text-sky-300 uppercase tracking-[0.16em] mb-2">
                Centro regulatorio Llanogas
              </p>
              <p className="text-[11px] text-slate-100 mb-3">
                Consolida la gestión de reportes regulatorios en un solo lugar:
                vencimientos, estados y responsables con trazabilidad completa.
              </p>
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <InfoChip title="Vencimientos" detail="Calendario centralizado" />
                <InfoChip title="Alertas" detail="Notificaciones configurables" />
                <InfoChip title="Trazabilidad" detail="Historial de envíos" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 self-stretch max-w-md ml-auto">
              <SmallInfoCard
                label="Visión ejecutiva"
                title="Dashboard de cumplimiento"
                description="Indicadores para seguimiento de obligaciones por entidad, frecuencia y criticidad."
              />
              <SmallInfoCard
                label="Trabajo colaborativo"
                title="Flujos y responsables"
                description="Asigna responsables, define aprobaciones y registra cambios sobre cada reporte."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Subcomponentes pequeños */

function InfoChip({ title, detail }) {
  return (
    <div className="rounded-xl bg-slate-900/70 border border-slate-700/60 px-3 py-2">
      <p className="text-[10px] font-semibold text-slate-100">{title}</p>
      <p className="text-[10px] text-slate-400">{detail}</p>
    </div>
  );
}

function SmallInfoCard({ label, title, description }) {
  return (
    <div className="rounded-2xl bg-slate-900/80 border border-emerald-400/40 px-4 py-3 shadow-[0_18px_60px_rgba(15,23,42,0.9)] backdrop-blur-md">
      <p className="text-[10px] uppercase tracking-[0.16em] text-emerald-300 mb-1">
        {label}
      </p>
      <p className="text-[11px] font-semibold text-slate-50 mb-1">
        {title}
      </p>
      <p className="text-[11px] text-slate-300">{description}</p>
    </div>
  );
}
