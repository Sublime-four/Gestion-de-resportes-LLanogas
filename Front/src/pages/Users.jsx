// src/pages/Users.jsx
// src/pages/Users.jsx
import React, { useEffect, useMemo, useState } from "react";

/**
 * Definición de roles según el documento:
 * - Rol
 * - Descripción
 * - Tareas en la solución
 */
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
const USERS_STORAGE_KEY = "users";


function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}

export default function Users() {
const [users, setUsers] = useState(() => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
});

// persistencia
useEffect(() => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch {
    // ignore
  }
}, [users]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    userId: "",
    fullName: "",
    email: "",
    process: "",
    position: "",
    roleId: "responsable_reportes",
    password: "",
    status: "Activo",
  });

  // Persistencia local
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("users", JSON.stringify(users));
    } catch {
      // ignore
    }
  }, [users]);

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
    return users.filter((u) => {
      const matchesSearch =
        q === "" ||
        u.fullName.toLowerCase().includes(q) ||
        u.userId.toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.process || "").toLowerCase().includes(q);

      const matchesRole =
        roleFilter === "Todos" ? true : u.roleId === roleFilter;

      const matchesStatus =
        statusFilter === "Todos" ? true : u.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const resetForm = () => {
    setForm({
      userId: "",
      fullName: "",
      email: "",
      process: "",
      position: "",
      roleId: "responsable_reportes",
      password: "",
      status: "Activo",
    });
    setEditingId(null);
  };

  const handleOpenNew = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setForm({
      userId: user.userId || "",
      fullName: user.fullName || "",
      email: user.email || "",
      process: user.process || "",
      position: user.position || "",
      roleId: user.roleId || "responsable_reportes",
      password: user.password || "",
      status: user.status || "Activo",
    });
    setEditingId(user.id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (
      !window.confirm(
        "¿Eliminar este usuario? El historial de reportes asignados podría perder trazabilidad."
      )
    ) {
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (!form.userId.trim() || !form.fullName.trim() || !form.email.trim()) {
      alert("ID usuario, nombre completo y correo son obligatorios.");
      return;
    }

    const ccRegex = /^\d+$/;
    if (!ccRegex.test(form.userId.trim())) {
      alert("El ID Usuario debe ser numérico (cédula).");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      alert("El correo electrónico no es válido.");
      return;
    }

    const timestamp = new Date().toISOString();

    if (editingId) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingId
            ? {
                ...u,
                ...form,
                userId: form.userId.trim(),
                fullName: form.fullName.trim(),
                email: form.email.trim(),
                process: form.process.trim(),
                position: form.position.trim(),
                updatedAt: timestamp,
              }
            : u
        )
      );
    } else {
      const exists = users.some(
        (u) => u.userId.trim() === form.userId.trim()
      );
      if (exists) {
        alert("Ya existe un usuario con ese ID. Usa otra cédula.");
        return;
      }

      const newUser = {
        id: Date.now(),
        userId: form.userId.trim(),
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        process: form.process.trim(),
        position: form.position.trim(),
        roleId: form.roleId,
        password: form.password, // para demo; en producción se encripta en backend
        status: form.status,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      setUsers((prev) => [...prev, newUser]);
    }

    setShowModal(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Resumen ejecutivo de usuarios */}
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
              placeholder="Buscar por nombre, ID, correo o proceso..."
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
              <th className="py-2 pl-4 font-medium">ID Usuario (Cédula)</th>
              <th className="py-2 font-medium">Nombre completo</th>
              <th className="py-2 font-medium">Rol</th>
              <th className="py-2 font-medium">Proceso</th>
              <th className="py-2 font-medium">Cargo</th>
              <th className="py-2 font-medium">Correo electrónico</th>
              <th className="py-2 font-medium">Estado</th>
              <th className="py-2 font-medium">Creado</th>
              <th className="py-2 pr-4 text-center font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map((u) => {
              const role = ROLE_DEFS.find((r) => r.id === u.roleId);

              return (
                <tr key={u.id} className="hover:bg-slate-50/70 text-slate-700">
                  <td className="py-2.5 pl-4 pr-2 text-[11px] font-medium text-slate-900">
                    {u.userId}
                  </td>
                  <td className="py-2.5 pr-2 text-[11px]">{u.fullName}</td>
                  <td className="py-2.5 pr-2 text-[11px]">
                    <RolePill role={role} />
                  </td>
                  <td className="py-2.5 pr-2 text-[11px]">
                    {u.process || "—"}
                  </td>
                  <td className="py-2.5 pr-2 text-[11px]">
                    {u.position || "—"}
                  </td>
                  <td className="py-2.5 pr-2 text-[11px] text-sky-700">
                    {u.email}
                  </td>
                  <td className="py-2.5 pr-2 text-[11px]">
                    <StatusPill status={u.status} />
                  </td>
                  <td className="py-2.5 pr-2 text-[11px] text-slate-500">
                    {formatDateTime(u.createdAt)}
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
                        className="px-2 py-1 rounded-lg border border-slate-200 text-[10px] hover:bg-slate-50"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredUsers.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="py-6 text-center text-[11px] text-slate-500"
                >
                  No hay usuarios registrados o no coinciden con los filtros.
                  Cuando conectes el backend, aquí se verán los usuarios
                  corporativos con sus roles.
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

function UserModal({ form, onChange, onClose, onSave, isEditing }) {
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

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-slate-600">
              ID Usuario (Cédula) *
            </span>
            <input
              type="text"
              value={form.userId}
              onChange={(e) => onChange("userId", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="Documento de identidad"
            />
          </label>

          <label className="flex flex-col gap-1 col-span-2">
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

          <label className="flex flex-col gap-1 col-span-2 md:col-span-1">
            <span className="text-[11px] text-slate-600">
              Correo electrónico *
            </span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => onChange("email", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="usuario@llanogas.com"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-slate-600">Proceso</span>
            <input
              type="text"
              value={form.process}
              onChange={(e) => onChange("process", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="Ej: Comercial, Operaciones, Jurídica"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-slate-600">Cargo</span>
            <input
              type="text"
              value={form.position}
              onChange={(e) => onChange("position", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="Ej: Analista, Coordinador, Jefe"
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

          <label className="flex flex-col gap-1 col-span-2">
            <span className="text-[11px] text-slate-600">
              Contraseña (demo)
            </span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => onChange("password", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="Se gestionará en backend en ambiente real"
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
            <p className="mt-2 text-slate-500">
              Más adelante estos roles se usarán para asignar responsables a
              los reportes, configurar alertas y mostrar la sección de
              &quot;Mis tareas pendientes&quot; por usuario.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-slate-900 text-[11px] font-medium text-white hover:bg-slate-800"
          >
            {isEditing ? "Guardar cambios" : "Crear usuario"}
          </button>
        </div>
      </form>
    </div>
  );
}
