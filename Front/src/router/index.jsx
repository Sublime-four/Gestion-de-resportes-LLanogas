// src/router/index.jsx
import React from "react";
import {
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import Reports from "../pages/Reports";
import Calendar from "../pages/Calendar";
import Settings from "../pages/Settings";
import Login from "../pages/Login";
import Compliance from "../pages/Compliance";
import Users from "../pages/Users";
import ForgotPassword from "../pages/ForgotPassword";
import LocationsMap from "../pages/LocationsMap";

import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";
import useAuth from "../hooks/useAuth";

// ---------- Ruta privada: solo si hay sesión ----------
function PrivateRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

// ---------- Definición de rutas ----------
export default function AppRouter() {
  return (
    <Routes>
      {/* Rutas de autenticación (sin sesión requerida) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* App interna protegida */}
      <Route element={<PrivateRoute />}>
        {/* redirect raíz */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Todas las internas envueltas en MainLayout */}
        <Route
          path="/dashboard"
          element={
            <MainLayout
              title="Dashboard de cumplimiento"
              subtitle="Visión general del estado regulatorio por entidad y reporte."
            >
              <Dashboard />
            </MainLayout>
          }
        />

        <Route
          path="/reports"
          element={
            <MainLayout
              title="Reportes regulatorios"
              subtitle="Gestión y seguimiento de los reportes enviados y pendientes."
            >
              <Reports />
            </MainLayout>
          }
        />

        <Route
          path="/calendar"
          element={
            <MainLayout
              title="Calendario de obligaciones"
              subtitle="Fechas clave de vencimientos y actividades."
            >
              <Calendar />
            </MainLayout>
          }
        />

        <Route
          path="/compliance"
          element={
            <MainLayout
              title="Tablero de cumplimiento"
              subtitle="Vista resumida del estado de los reportes frente a las entidades."
            >
              <Compliance />
            </MainLayout>
          }
        />

        <Route
          path="/users"
          element={
            <MainLayout
              title="Usuarios y roles"
              subtitle="Gestión básica de accesos al sistema de reportes."
            >
              <Users />
            </MainLayout>
          }
        />

        <Route
          path="/settings"
          element={
            <MainLayout
              title="Configuración"
              subtitle="Parámetros generales de la plataforma."
            >
              <Settings />
            </MainLayout>
          }
        />
      </Route>

      <Route
  path="/locations-map"
  element={
    <MainLayout
      title="Mapa de localizaciones"
      subtitle="Visualización geográfica de activos y puntos de operación."
    >
      <LocationsMap />
    </MainLayout>
  }
/>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
