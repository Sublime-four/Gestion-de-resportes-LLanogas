// src/store/AuthContext.jsx
import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

const STORAGE_KEY = "llanogas_auth_user";
const API_BASE_URL = "http://localhost:8080";

// -----------------------------------------------------------
// NORMALIZADOR DE ROLES (pero ya esperamos strings tipo "admin")
// -----------------------------------------------------------
function normalizeRoleId(raw) {
  if (raw == null) return "consulta_auditoria";

  const v = String(raw).toLowerCase().trim();

  // Si ya viene el code correcto desde backend
  if (
    v === "admin" ||
    v === "responsable_reportes" ||
    v === "supervisor_cumplimiento" ||
    v === "consulta_auditoria"
  ) {
    return v;
  }

  // Por si acaso viene un nombre raro
  if (v.includes("admin")) return "admin";
  if (v.includes("responsable")) return "responsable_reportes";
  if (v.includes("supervisor")) return "supervisor_cumplimiento";
  if (v.includes("auditor") || v.includes("consulta"))
    return "consulta_auditoria";

  // Si viene como número (por si algún día vuelves a IDs)
  const n = Number(v);
  if (!Number.isNaN(n)) {
    switch (n) {
      case 2:
        return "admin";
      case 3:
        return "responsable_reportes";
      case 4:
        return "supervisor_cumplimiento";
      case 5:
        return "consulta_auditoria";
      default:
        return "consulta_auditoria";
    }
  }

  return "consulta_auditoria";
}

const ROLE_LABELS = {
  admin: "Administrador del sistema",
  responsable_reportes: "Responsable de los reportes",
  supervisor_cumplimiento: "Supervisor de cumplimiento",
  consulta_auditoria: "Usuario de consulta / Auditoría",
};

// -----------------------------------------------------------
// CARGA INICIAL DESDE LOCALSTORAGE O SESSION
// -----------------------------------------------------------
function loadInitialUser() {
  if (typeof window === "undefined") return null;

  try {
    const fromLocal = localStorage.getItem(STORAGE_KEY);
    if (fromLocal) return JSON.parse(fromLocal);

    const fromSession = sessionStorage.getItem(STORAGE_KEY);
    if (fromSession) return JSON.parse(fromSession);

    return null;
  } catch {
    return null;
  }
}

// -----------------------------------------------------------
// PROVIDER
// -----------------------------------------------------------
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadInitialUser());

  const login = async (email, password, options = {}) => {
    const { remember = true } = options;

    const resp = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!resp.ok) {
      let msg = "Credenciales inválidas o usuario no autorizado.";
      try {
        const data = await resp.json();
        if (data?.message) msg = data.message;
      } catch {
        // ignoramos error de parseo
      }
      throw new Error(msg);
    }

    const data = await resp.json();
    const apiUser = data.user || {};
    const token = data.token || null;

    // 👇 AQUÍ asumimos que el backend ya manda roleId y roleName
    const rawRole = apiUser.roleId ?? apiUser.role ?? apiUser.roleName ?? "";

    const roleId = normalizeRoleId(rawRole);

    const userPayload = {
      id: apiUser.id,
      email: apiUser.email || email,
      name: apiUser.fullName || apiUser.name || "",
      roleId, // ← EL QUE USA permissions.js
      role: apiUser.roleName || ROLE_LABELS[roleId] || String(rawRole),
      token,
    };

    console.log("🟢 USER LOGIN:", userPayload);

    setUser(userPayload);

    // Persistencia
    if (typeof window !== "undefined") {
      try {
        const serialized = JSON.stringify(userPayload);
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(STORAGE_KEY);

        if (remember) {
          localStorage.setItem(STORAGE_KEY, serialized);
        } else {
          sessionStorage.setItem(STORAGE_KEY, serialized);
        }
      } catch {
        // ignore
      }
    }

    return userPayload;
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
