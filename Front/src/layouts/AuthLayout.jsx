// src/layouts/AuthLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      {/* aquí va tu UI de login, branding, etc. */}
      <Outlet />
    </div>
  );
}
