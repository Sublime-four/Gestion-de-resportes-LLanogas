// src/router/RequirePermission.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "../store/AuthContext";
import { can } from "../store/permissions";

export default function RequirePermission({ permission, children }) {
  const { user } = useAuthContext();

  // no logueado → a login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // logueado sin permiso → donde quieras (403, dashboard, etc.)
  if (!can(user, permission)) {
    return <Navigate to="/forbidden" replace />;
    // o <Navigate to="/" replace />;
  }

  // tiene permiso → render normal
  return children;
}
