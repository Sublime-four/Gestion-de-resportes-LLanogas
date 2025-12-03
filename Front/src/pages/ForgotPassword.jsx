// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoLlanogas from "../assets/logo-llanogas.png";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (sending) return;

    setSending(true);
    setMessage("");
    setError("");

    try {
      // TODO: reemplazar por tu endpoint real
      // Ejemplo:
      // await fetch("/api/auth/forgot-password", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email }),
      // });

      setMessage(
        "Si el correo existe en el sistema, se enviará un enlace para restablecer la contraseña."
      );
    } catch (err) {
      setError("Ocurrió un error al procesar la solicitud. Intenta de nuevo.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center">
      <div className="w-full max-w-md rounded-[32px] bg-slate-900/90 border border-sky-500/10 shadow-[0_40px_120px_rgba(15,23,42,0.9)] backdrop-blur-xl p-8 text-slate-100">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-9 w-9 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center overflow-hidden">
            <img
              src={logoLlanogas}
              alt="Llanogas"
              className="w-7 h-7 object-contain"
            />
          </div>
          <div>
            <p className="text-xs font-medium tracking-[0.22em] uppercase text-sky-300">
              LLANOGAS
            </p>
            <p className="text-[11px] text-slate-400">
              Restablecimiento de contraseña
            </p>
          </div>
        </div>

        <h1 className="text-xl font-semibold mb-2">¿Olvidaste tu contraseña?</h1>
        <p className="text-[13px] text-slate-400 mb-4">
          Ingresa tu correo corporativo y, si existe en el sistema, recibirás un
          enlace para definir una nueva contraseña.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 rounded-xl bg-slate-900/60 border border-slate-700/70 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-400 transition"
                placeholder="usuario@llanogas.com"
                autoComplete="email"
              />
            </div>
          </div>

          {message && (
            <p className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">
              {message}
            </p>
          )}
          {error && (
            <p className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={sending}
            className="mt-2 h-10 w-full rounded-xl bg-sky-500 text-xs font-semibold text-white shadow-[0_14px_40px_rgba(56,189,248,0.45)] hover:bg-sky-400 transition disabled:opacity-70 disabled:cursor-wait"
          >
            {sending ? "Enviando..." : "Enviar enlace de restablecimiento"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="mt-2 w-full text-[11px] text-slate-400 hover:text-slate-200"
          >
            ← Volver a iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
}
