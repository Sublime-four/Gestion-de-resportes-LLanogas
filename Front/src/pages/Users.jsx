// src/pages/Users.jsx
import React, { useEffect, useMemo, useState } from "react";

export const ROLE_DEFS = [
  {
    id: "admin",
    label: "Administrador del sistema",
    description:
      "Tiene acceso y control total sobre todos los módulos y configuraciones.",
    tasks:
      "Gestiona los roles y puede intervenir en casos de emergencia. No participa en la aprobación diaria de contenido.",
  },
  {
    id: "responsable_reportes",
    label: "Responsable de los reportes",
    description:
      "Usuario asignado para la presentación de los reportes, pero no tiene control sobre la configuración del sistema.",
    tasks:
      "Es la persona que se encarga de la entrega de los reportes, configuración de alertas y correos de notificación.",
  },
  {
    id: "supervisor_cumplimiento",
    label: "Supervisor de cumplimiento",
    description:
      "Supervisa el cumplimiento y recibe las alertas de vencimiento y criticidad.",
    tasks:
      "Configuración de alertas y correos de notificación. Aprueba o hace seguimiento al estado de los envíos.",
  },
  {
    id: "consulta_auditoria",
    label: "Usuario de consulta / Auditoría",
    description:
      "Usuario que solo necesita consultar el estado de cumplimiento y los reportes enviados.",
    tasks:
      "Acceso al resumen mensual de cumplimiento y reportes visuales con gráficos.",
  },
];

const ESTADO_OPTIONS = ["Activo", "Inactivo"];
const API_BASE = "/api/users";

function validateUser(form, users, editingId) {
  if (!form.fullName.trim() || !form.email.trim()) {
    return "Nombre completo y correo son obligatorios.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(form.email.trim())) {
    return "El correo electrónico no es válido.";
  }

  // Evitar duplicado por correo (excepto el que edito)
  const exists = users.some(
    (u) =>
      (u.email || "").trim().toLowerCase() ===
        form.email.trim().toLowerCase() && u.id !== editingId
  );

  if (exists) {
    return "Ya existe un usuario con ese correo.";
  }

  return null;
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    fullName: "",
    email: "",
    roleId: "responsable_reportes",
    password: "",
    status: "Activo",
  };

  const [form, setForm] = useState(emptyForm);

  // Cargar usuarios desde backend
  useEffect(() => {
    let isMounted = true;

    async function fetchUsers() {
  setLoading(true);
  setLoadingError(null);
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error("Error al cargar usuarios desde el servidor.");

    const raw = await res.json();

    if (!isMounted) return;

    const data = Array.isArray(raw)
      ? raw.map((u) => ({
          id: u.id,
       
          fullName: u.fullName || u.name || "",
          email: u.email,
          roleId: u.roleId,          
          status: u.status || "Activo",
        }))
      : [];

    setUsers(data);
  } catch (err) {
    if (isMounted) {
      setLoadingError(err.message || "Error inesperado al cargar usuarios.");
      setUsers([]);
    }
  } finally {
    if (isMounted) setLoading(false);
  }
}


    fetchUsers();
    return () => {
      isMounted = false;
    };
  }, []);

  // Métricas de cabecera
  const metrics = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "Activo").length;
    const responsables = users.filter(
      (u) => u.roleId === "responsable_reportes"
    ).length;
    const supervisores = users.filter(
      (u) => u.roleId === "supervisor_cumplimiento"
    ).length;
    return { total, active, responsables, supervisores };
  }, [users]);

  // Filtros
  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();

    return users
      .filter((u) => {
        const fullName = (u.fullName || "").toLowerCase();
        const email = (u.email || "").toLowerCase();

        const matchesSearch =
          q === "" || fullName.includes(q) || email.includes(q);

        const matchesRole =
          roleFilter === "Todos" ? true : u.roleId === roleFilter;

        const matchesStatus =
          statusFilter === "Todos" ? true : u.status === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
      })
      .sort((a, b) =>
        (a.fullName || "").localeCompare(b.fullName || "", "es", {
          sensitivity: "base",
        })
      );
  }, [users, search, roleFilter, statusFilter]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleOpenNew = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setForm({
      fullName: user.fullName || "",
      email: user.email || "",
      roleId: user.roleId || "responsable_reportes",
      password: "",
      status: user.status || "Activo",
    });
    setEditingId(user.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este usuario?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo eliminar el usuario.");
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert(err.message || "Error inesperado al eliminar el usuario.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const errorMsg = validateUser(form, users, editingId);
    if (errorMsg) {
      alert(errorMsg);
      return;
    }

    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      roleId: form.roleId,
      status: form.status,
    };

    if (form.password && form.password.trim()) {
      payload.password = form.password.trim();
    }

    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch(`${API_BASE}/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("No se pudo actualizar el usuario.");
        const updated = await res.json();
        setUsers((prev) =>
          prev.map((u) => (u.id === updated.id ? updated : u))
        );
      } else {
        const res = await fetch(API_BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("No se pudo crear el usuario.");
        const created = await res.json();
        setUsers((prev) => [...prev, created]);
      }

      setShowModal(false);
      resetForm();
    } catch (err) {
      alert(err.message || "Error inesperado al guardar el usuario.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Resumen ejecutivo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          label="Usuarios registrados"
          value={metrics.total}
          helper="Total de personas con acceso al sistema."
        />
        <MetricCard
          label="Activos"
          value={metrics.active}
          tone="success"
          helper="Usuarios habilitados para iniciar sesión."
        />
        <MetricCard
          label="Responsables de reportes"
          value={metrics.responsables}
          tone="warning"
          helper="Usuarios que pueden presentar y marcar envíos."
        />
        <MetricCard
          label="Supervisores de cumplimiento"
          value={metrics.supervisores}
          tone="neutral"
          helper="Usuarios que reciben alertas y supervisan el cumplimiento."
        />
      </div>

      {/* Filtros + acciones */}
      <div className="bg-white rounded-2xl border border-slate-200 px-4 py-4 md:px-5 md:py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
              Rol
            </span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="Todos">Todos</option>
              {ROLE_DEFS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
              Estado
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="Todos">Todos</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-72 rounded-full border border-slate-200 bg-slate-50 px-8 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
            <span className="pointer-events-none absolute left-2 top-1.5 text-slate-400 text-sm">
              🔍
            </span>
          </div>

          <button
            onClick={handleOpenNew}
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 h-9 text-xs font-medium text-white hover:bg-slate-800"
          >
            + Nuevo usuario
          </button>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Gestión de usuarios y roles
            </h2>
            <p className="text-[11px] text-slate-500">
              Registro de personas, roles y procesos vinculados a los reportes.
            </p>
          </div>
          <span className="text-[11px] text-slate-500">
            {filteredUsers.length} usuario(s) visible(s)
          </span>
        </div>

        <table className="w-full text-xs text-left">
          <thead className="border-b border-slate-200 bg-slate-50/60 text-slate-500">
            <tr>
              <th className="py-2 pl-4 font-medium">Nombre completo</th>
              <th className="py-2 font-medium">Rol</th>
              <th className="py-2 font-medium">Correo electrónico</th>
              <th className="py-2 font-medium">Estado</th>
              <th className="py-2 pr-4 text-center font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td
                  colSpan={5}
                  className="py-6 text-center text-[11px] text-slate-500"
                >
                  Cargando usuarios desde el servidor...
                </td>
              </tr>
            )}

            {!loading && loadingError && (
              <tr>
                <td
                  colSpan={5}
                  className="py-6 text-center text-[11px] text-red-500"
                >
                  {loadingError}
                </td>
              </tr>
            )}

            {!loading &&
              !loadingError &&
              filteredUsers.map((u) => {
                const role = ROLE_DEFS.find((r) => r.id === u.roleId);
                return (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/70 text-slate-700"
                  >
                    <td className="py-2.5 pl-4 pr-2 text-[11px]">
                      {u.fullName}
                    </td>
                    <td className="py-2.5 pr-2 text-[11px]">
                      <RolePill role={role} />
                    </td>
                    <td className="py-2.5 pr-2 text-[11px] text-sky-700">
                      {u.email}
                    </td>
                    <td className="py-2.5 pr-2 text-[11px]">
                      <StatusPill status={u.status} />
                    </td>
                    <td className="py-2.5 pr-4 text-center">
                      <div className="inline-flex gap-1">
                        <button
                          onClick={() => handleEdit(u)}
                          className="px-2 py-1 rounded-lg border border-slate-200 text-[10px] hover:bg-slate-50"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          disabled={deletingId === u.id}
                          className="px-2 py-1 rounded-lg border border-slate-200 text-[10px] hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingId === u.id ? "Eliminando..." : "Eliminar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

            {!loading &&
              !loadingError &&
              filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-6 text-center text-[11px] text-slate-500"
                  >
                    No hay usuarios registrados o no coinciden con los filtros.
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>

      {/* Modal crear / editar usuario */}
      {showModal && (
        <UserModal
          form={form}
          onChange={handleFormChange}
          onClose={() => {
            setShowModal(false);
            resetForm();
          }}
          onSave={handleSave}
          isEditing={!!editingId}
          saving={saving}
        />
      )}
    </div>
  );
}

/* ---------- Components auxiliares ---------- */

function MetricCard({ label, value, helper, tone = "neutral" }) {
  const tones = {
    neutral:
      "border-slate-200 bg-white text-slate-900 shadow-[0_10px_30px_rgba(15,23,42,0.04)]",
    success:
      "border-emerald-100 bg-emerald-50 text-emerald-900 shadow-[0_10px_30px_rgba(16,185,129,0.12)]",
    warning:
      "border-amber-100 bg-amber-50 text-amber-900 shadow-[0_10px_30px_rgba(245,158,11,0.12)]",
    danger:
      "border-red-100 bg-red-50 text-red-900 shadow-[0_10px_30px_rgba(239,68,68,0.12)]",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 text-xs ${tones[tone]}`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-soft-light bg-[radial-gradient(circle_at_0_0,#ffffff,transparent_55%),radial-gradient(circle_at_100%_0,#e5e7eb,transparent_55%)]" />
      <div className="relative space-y-1">
        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-600 mb-1">
          {label}
        </p>
        <p className="text-xl font-semibold text-slate-900 mb-0.5">{value}</p>
        {helper && (
          <p className="text-[11px] text-slate-600 leading-snug">{helper}</p>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    Activo: "bg-emerald-100 text-emerald-800",
    Inactivo: "bg-slate-200 text-slate-700",
  };
  const cls = map[status] || "bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium ${cls}`}
    >
      {status}
    </span>
  );
}

function RolePill({ role }) {
  if (!role) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
        Rol no asignado
      </span>
    );
  }
  const map = {
    admin: "bg-slate-900 text-white",
    responsable_reportes: "bg-sky-100 text-sky-800",
    supervisor_cumplimiento: "bg-amber-100 text-amber-800",
    consulta_auditoria: "bg-slate-100 text-slate-700",
  };
  const cls = map[role.id] || "bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium ${cls}`}
    >
      {role.label}
    </span>
  );
}

function UserModal({ form, onChange, onClose, onSave, isEditing, saving }) {
  const selectedRole =
    ROLE_DEFS.find((r) => r.id === form.roleId) || ROLE_DEFS[0];

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onSubmit={onSave}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 p-5 space-y-4 text-xs"
      >
        <h3 className="text-sm font-semibold text-slate-900 mb-1">
          {isEditing ? "Editar usuario" : "Nuevo usuario"}
        </h3>
        <p className="text-[11px] text-slate-500 mb-2">
          Registra los datos de la persona y el rol que tendrá dentro de la
          gestión de reportes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-[11px] text-slate-600">
              Nombre completo *
            </span>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => onChange("fullName", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="Nombre y apellidos"
            />
          </label>

          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-[11px] text-slate-600">
              Correo electrónico *
            </span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => onChange("email", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="usuario@empresa.com"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-slate-600">Rol</span>
            <select
              value={form.roleId}
              onChange={(e) => onChange("roleId", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              {ROLE_DEFS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-slate-600">Estado</span>
            <select
              value={form.status}
              onChange={(e) => onChange("status", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              {ESTADO_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-[11px] text-slate-600">
              Contraseña {isEditing ? "(opcional)" : "(demo)"}
            </span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => onChange("password", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder={
                isEditing
                  ? "Déjalo vacío para no cambiar la contraseña"
                  : "Se gestionará en backend en ambiente real"
              }
            />
          </label>
        </div>

        {/* Panel de rol y tareas */}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-[2fr,3fr] gap-4 border-t border-slate-100 pt-4">
          <div className="text-[11px] text-slate-600">
            <p className="font-semibold text-slate-800 mb-1">
              Rol seleccionado
            </p>
            <p className="text-slate-900">{selectedRole.label}</p>
            <p className="mt-1">{selectedRole.description}</p>
          </div>
          <div className="text-[11px] text-slate-600">
            <p className="font-semibold text-slate-800 mb-1">
              Tareas en la solución
            </p>
            <p>{selectedRole.tasks}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] text-slate-600 hover:bg-slate-50"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-3 py-1.5 rounded-lg bg-slate-900 text-[11px] font-medium text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving
              ? "Guardando..."
              : isEditing
              ? "Guardar cambios"
              : "Crear usuario"}
          </button>
        </div>
      </form>
    </div>
  );
}
