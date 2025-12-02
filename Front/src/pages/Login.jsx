// src/pages/Login.jsx
import React from "react";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0_0,#f97316,transparent_55%),radial-gradient(circle_at_100%_100%,#22c55e,transparent_55%)] opacity-30" />
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl shadow-2xl p-6 backdrop-blur">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-sm font-bold text-slate-950">
              LG
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">
                LLANOGAS Compliance
              </h1>
              <p className="text-[11px] text-slate-400">
                Plataforma de gestión de reportes regulatorios
              </p>
            </div>
          </div>

          <h2 className="text-sm font-semibold text-white mb-1">
            Inicia sesión
          </h2>
          <p className="text-[11px] text-slate-400 mb-4">
            Usa tus credenciales corporativas para continuar.
          </p>

          <form className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] text-slate-300 mb-1">
                Correo corporativo
              </label>
              <input
                type="email"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="tucorreo@llanogas.com"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-300 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="••••••••"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-[11px] text-slate-300">
                <input
                  type="checkbox"
                  className="h-3 w-3 rounded border-slate-600 bg-slate-900"
                />
                Recordar sesión
              </label>
              <button
                type="button"
                className="text-[11px] text-emerald-400 hover:text-emerald-300"
              >
                Olvidé mi contraseña
              </button>
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs py-2 rounded-lg"
            >
              Entrar
            </button>
          </form>

          <p className="mt-4 text-[10px] text-slate-500 text-center">
            Acceso restringido. Solo usuarios autorizados de LLANOGAS.
          </p>
        </div>
      </div>
    </div>
  );
}
