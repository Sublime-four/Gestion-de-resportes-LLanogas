// src/store/permissions.js
export const ROLE_PERMISSIONS = {
  admin: [
    "nav.dashboard",
    "nav.myTasks",
    "nav.reports",
    "nav.entities",
    "nav.calendar",
    "nav.compliance",
    "nav.locations",
    "nav.users",
    "nav.settings",
  ],
  responsable_reportes: [
    "nav.dashboard",
    "nav.myTasks",
    "nav.reports",
    "nav.entities",
    "nav.calendar",
    "nav.compliance",
    "nav.locations",
  ],
  supervisor_cumplimiento: [
    "nav.dashboard",
    "nav.myTasks",
    "nav.reports",
    "nav.entities",
    "nav.calendar",
    "nav.compliance",
    "nav.locations",
  ],
  consulta_auditoria: [
    "nav.dashboard",
    "nav.reports",
    "nav.entities",
    "nav.compliance",
    "nav.locations",
  ],
};

export function can(user, permission) {
  if (!user) return false;
  const perms = ROLE_PERMISSIONS[user.roleId] || [];
  return perms.includes(permission);
}
