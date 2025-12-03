// src/pages/Users.jsx
import React, { useMemo, useState } from "react";

export default function Users() {
  // ⚙️ Fuente de la verdad: vendrá del backend
  // TODO: poblar este estado con la API (useEffect / react-query / etc.)
  const [users, setUsers] = useState([]); // [{ name, email, role, area, status, lastAccess }]

  // búsqueda + filtros
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("Todos");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [filterArea, setFilterArea] = useState("Todas");

  // modal nuevo usuario
  const [showNewUser, setShowNewUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "Consulta",
    area: "",
    status: "Pendiente",
  });

  // métricas dinámicas (sobre la data real)
  const metrics = useMemo(() => {
    const total = users.length;
    const activos = users.filter((u) => u.status === "Activo").length;
    const pendientes = users.filter((u) => u.status === "Pendiente").length;
    const admins = users.filter((u) => u.role === "Administrador").length;
    return { total, activos, pendientes, admins };
  }, [users]);

  // opciones para filtros
  const roleOptions = ["Todos", "Administrador", "Gestor de reportes", "Consulta"];
  const statusOptions = ["Todos", "Activo", "Pendiente", "Suspendido"];
  const areaOptions = useMemo(() => {
    const set = new Set(users.map((u) => u.area).filter(Boolean));
    return ["Todas", ...Array.from(set)];
  }, [users]);

  // lista filtrada
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        search.trim() === "" ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());

      const matchesRole =
        filterRole === "Todos" ? true : u.role === filterRole;

      const matchesStatus =
        filterStatus === "Todos" ? true : u.status === filterStatus;

      const matchesArea =
        filterArea === "Todas" ? true : u.area === filterArea;

      return matchesSearch && matchesRole && matchesStatus && matchesArea;
    });
  }, [users, search, filterRole, filterStatus, filterArea]);

  const handleOpenNewUser = () => {
    setNewUser({
      name: "",
      email: "",
      role: "Consulta",
      area: "",
      status: "Pendiente",
    });
    setShowNewUser(true);
  };

  const handleChangeNewUser = (field, value) => {
    setNewUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveNewUser = (e) => {
    e.preventDefault();

    if (!newUser.name.trim() || !newUser.email.trim()) {
      alert("Nombre y correo son obligatorios.");
      return;
    }

    // TODO: reemplazar por llamada al backend para crear usuario
    const userToAdd = {
      ...newUser,
      lastAccess: "—",
    };

    setUsers((prev) => [...prev, userToAdd]);
    setShowNewUser(false);
  };

  return (
    <div className="space-y-6">
      {/* Resumen ejecutivo dinámico */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          label="Usuarios registrados"
          value={metrics.total}
          helper="Incluye internos y externos."
        />
        <MetricCard
          label="Activos"
          value={metrics.activos}
          tone="success"
          helper="Con acceso vigente al sistema."
        />
        <MetricCard
          label="Pendientes de activación"
          value={metrics.pendientes}
          tone="warning"
          helper="Invitaciones sin completar."
        />
        <MetricCard
          label="Perfiles administradores"
          value={metrics.admins}
          tone="neutral"
          helper="Responsables de configuración."
        />
      </div>

      {/* Filtros + acciones */}
      <div className="bg-white rounded-2xl border border-slate-200 px-4 py-4 md:px-5 md:py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-3 text-xs">
          <FilterSelect
            label="Rol"
            value={filterRole}
            options={roleOptions}
            onChange={setFilterRole}
          />
          <FilterSelect
            label="Estado"
            value={filterStatus}
            options={statusOptions}
            onChange={setFilterStatus}
          />
          <FilterSelect
            label="Área"
            value={filterArea}
            options={areaOptions}
            onChange={setFilterArea}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-64 rounded-full border border-slate-200 bg-slate-50 px-8 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
            <span className="pointer-events-none absolute left-2 top-1.5 text-slate-400 text-sm">
              🔍
            </span>
          </div>
          <button
            onClick={handleOpenNewUser}
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
              Usuarios y roles
            </h2>
            <p className="text-[11px] text-slate-500">
              Administración de accesos al módulo de reportes regulatorios.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3 text-[11px] text-slate-500">
            <LegendStatus color="bg-emerald-500" label="Activo" />
            <LegendStatus color="bg-amber-500" label="Pendiente" />
            <LegendStatus color="bg-slate-400" label="Suspendido" />
          </div>
        </div>

        <table className="w-full text-xs text-left">
          <thead className="border-b border-slate-200 bg-slate-50/60 text-slate-500">
            <tr>
              <th className="py-2 pl-4 font-medium">Usuario</th>
              <th className="py-2 font-medium">Correo</th>
              <th className="py-2 font-medium">Rol</th>
              <th className="py-2 font-medium">Área</th>
              <th className="py-2 font-medium">Último acceso</th>
              <th className="py-2 pr-4 text-center font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map((u) => (
              <UserRow key={u.email} {...u} />
            ))}

            {filteredUsers.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-6 text-center text-[11px] text-slate-500"
                >
                  No se encontraron usuarios con los filtros actuales.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-[11px] text-slate-500">
          <span>
            Mostrando {filteredUsers.length} de {users.length} usuarios
          </span>
          <div className="flex items-center gap-1 opacity-60 pointer-events-none">
            {/* Paginación placeholder; se puede reemplazar por la del backend */}
            <button className="px-2 py-1 rounded-lg border border-slate-200">
              ‹
            </button>
            <span className="px-2">1</span>
            <button className="px-2 py-1 rounded-lg border border-slate-200">
              2
            </button>
            <button className="px-2 py-1 rounded-lg border border-slate-200">
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Modal nuevo usuario */}
      {showNewUser && (
        <NewUserModal
          newUser={newUser}
          onChange={handleChangeNewUser}
          onCancel={() => setShowNewUser(false)}
          onSave={handleSaveNewUser}
        />
      )}
    </div>
  );
}

/* Components auxiliares */

function MetricCard({ label, value, helper, tone = "neutral" }) {
  const tones = {
    neutral: "border-slate-200 bg-white text-slate-900",
    success: "border-emerald-100 bg-emerald-50 text-emerald-900",
    warning: "border-amber-100 bg-amber-50 text-amber-900",
    danger: "border-red-100 bg-red-50 text-red-900",
  };

  return (
    <div
      className={`relative rounded-2xl border p-4 text-xs shadow-sm ${tones[tone]}`}
    >
      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 mb-1">
        {label}
      </p>
      <p className="text-xl font-semibold text-slate-900 mb-0.5">{value}</p>
      {helper && <p className="text-[11px] text-slate-500">{helper}</p>}
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }) {
  return (
    <div className="flex flex-col gap-1 text-[11px]">
      <span className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function LegendStatus({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span>{label}</span>
    </span>
  );
}

function RolePill({ role }) {
  const map = {
    Administrador: "bg-slate-900 text-slate-50",
    "Gestor de reportes": "bg-sky-100 text-sky-800",
    Consulta: "bg-slate-100 text-slate-700",
  };

  const cls = map[role] || "bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium ${cls}`}
    >
      {role}
    </span>
  );
}

function UserRow({ name, email, role, area, status, lastAccess }) {
  const statusClass =
    status === "Activo"
      ? "bg-emerald-100 text-emerald-800"
      : status === "Pendiente"
      ? "bg-amber-100 text-amber-800"
      : "bg-slate-200 text-slate-700";

  return (
    <tr className="text-slate-700 hover:bg-slate-50/80 transition">
      <td className="py-2.5 pl-4 pr-2 text-[11px]">
        <p className="font-semibold text-slate-900">{name}</p>
      </td>
      <td className="py-2.5 pr-2 text-[11px] text-slate-500">{email}</td>
      <td className="py-2.5 pr-2 text-[11px]">
        <RolePill role={role} />
      </td>
      <td className="py-2.5 pr-2 text-[11px] text-slate-600">{area}</td>
      <td className="py-2.5 pr-2 text-[11px] text-slate-500">
        {lastAccess || "—"}
      </td>
      <td className="py-2.5 pr-4 text-center">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium ${statusClass}`}
        >
          {status}
        </span>
      </td>
    </tr>
  );
}

// Modal simple para crear usuario
function NewUserModal({ newUser, onChange, onCancel, onSave }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <form
        onSubmit={onSave}
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 p-5 space-y-4 text-xs"
      >
        <h3 className="text-sm font-semibold text-slate-900">
          Nuevo usuario
        </h3>

        <div className="space-y-2">
          <label className="block">
            <span className="block text-[11px] text-slate-600 mb-1">
              Nombre completo
            </span>
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => onChange("name", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </label>

          <label className="block">
            <span className="block text-[11px] text-slate-600 mb-1">
              Correo
            </span>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => onChange("email", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-[11px] text-slate-600 mb-1">
                Rol
              </span>
              <select
                value={newUser.role}
                onChange={(e) => onChange("role", e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option>Administrador</option>
                <option>Gestor de reportes</option>
                <option>Consulta</option>
              </select>
            </label>

            <label className="block">
              <span className="block text-[11px] text-slate-600 mb-1">
                Estado
              </span>
              <select
                value={newUser.status}
                onChange={(e) => onChange("status", e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option>Activo</option>
                <option>Pendiente</option>
                <option>Suspendido</option>
              </select>
            </label>
          </div>

          <label className="block">
            <span className="block text-[11px] text-slate-600 mb-1">
              Área / Dependencia
            </span>
            <input
              type="text"
              value={newUser.area}
              onChange={(e) => onChange("area", e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-slate-900 text-[11px] font-medium text-white hover:bg-slate-800"
          >
            Guardar usuario
          </button>
        </div>
      </form>
    </div>
  );
}
