// src/router/index.jsx (solo las partes clave)
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
import Entities from "../pages/Entities";
import MyTasks from "../pages/MyTasks";

import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";
import useAuth from "../hooks/useAuth";
import { can } from "../store/permissions";

// Ruta privada básica (solo sesión)
function PrivateRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

// Guardia por permiso usando permissions.js
function PermissionRoute({ permission, children }) {
  const { user, isAuthenticated } = useAuth();

  // Si no está autenticado, que lo maneje PrivateRoute
  if (!isAuthenticated) {
    return children;
  }

  // Si no se ha definido un permiso, deja pasar
  if (!permission) return children;

  const hasPermission = can(user, permission);

  if (!hasPermission) {
    return (
      <div className="p-6 text-sm text-red-600">
        No tienes permisos para ver esta sección.
      </div>
    );
  }

  return children;
}

export default function AppRouter() {
  return (
    <Routes>
      {/* Auth */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* App interna */}
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route
          path="/dashboard"
          element={
            <PermissionRoute permission="nav.dashboard">
              <MainLayout
                title="Dashboard de cumplimiento"
                subtitle="Visión general del estado regulatorio por entidad y reporte."
              >
                <Dashboard />
              </MainLayout>
            </PermissionRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <PermissionRoute permission="nav.reports">
              <MainLayout
                title="Reportes regulatorios"
                subtitle="Gestión y seguimiento de los reportes enviados y pendientes."
              >
                <Reports />
              </MainLayout>
            </PermissionRoute>
          }
        />

        <Route
          path="/calendar"
          element={
            <PermissionRoute permission="nav.calendar">
              <MainLayout
                title="Calendario de obligaciones"
                subtitle="Fechas clave de vencimientos y actividades."
              >
                <Calendar />
              </MainLayout>
            </PermissionRoute>
          }
        />

        <Route
          path="/compliance"
          element={
            <PermissionRoute permission="nav.compliance">
              <MainLayout
                title="Tablero de cumplimiento"
                subtitle="Vista resumida del estado de los reportes frente a las entidades."
              >
                <Compliance />
              </MainLayout>
            </PermissionRoute>
          }
        />

        <Route
          path="/users"
          element={
            <PermissionRoute permission="nav.users">
              <MainLayout
                title="Usuarios y roles"
                subtitle="Gestión básica de accesos al sistema de reportes."
              >
                <Users />
              </MainLayout>
            </PermissionRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <PermissionRoute permission="nav.settings">
              <MainLayout
                title="Configuración"
                subtitle="Parámetros generales de la plataforma."
              >
                <Settings />
              </MainLayout>
            </PermissionRoute>
          }
        />

        <Route
          path="/my-tasks"
          element={
            <PermissionRoute permission="nav.myTasks">
              <MainLayout
                title="Mis tareas pendientes"
                subtitle="Obligaciones de reporte asignadas a tu usuario."
              >
                <MyTasks />
              </MainLayout>
            </PermissionRoute>
          }
        />

        <Route
          path="/locations-map"
          element={
            <PermissionRoute permission="nav.locations">
              <MainLayout
                title="Mapa de localizaciones"
                subtitle="Visualización geográfica de activos y puntos de operación."
              >
                <LocationsMap />
              </MainLayout>
            </PermissionRoute>
          }
        />

        <Route
          path="/entities"
          element={
            <PermissionRoute permission="nav.entities">
              <MainLayout
                title="Entidades de control"
                subtitle="Catálogo centralizado de entidades reguladoras."
              >
                <Entities />
              </MainLayout>
            </PermissionRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
