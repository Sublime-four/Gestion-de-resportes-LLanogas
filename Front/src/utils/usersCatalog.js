// src/utils/usersCatalog.js
const USERS_STORAGE_KEY = "users";

export function getAllUsersFromStorage() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getActiveUsers() {
  return getAllUsersFromStorage().filter((u) => u.status === "Activo");
}

export function getUsersByRole(roleId, { onlyActive = true } = {}) {
  const base = onlyActive ? getActiveUsers() : getAllUsersFromStorage();
  return base.filter((u) => u.roleId === roleId);
}

export function getReportResponsibles(options) {
  return getUsersByRole("responsable_reportes", options);
}

export function getComplianceSupervisors(options) {
  return getUsersByRole("supervisor_cumplimiento", options);
}

export function getAuditViewers(options) {
  return getUsersByRole("consulta_auditoria", options);
}

export function getAlertRecipientsForReport(report) {
  const allUsers = getAllUsersFromStorage();

  const responsable = allUsers.find(
    (u) => String(u.id) === String(report.responsableUserId)
  );

  const supervisores = getComplianceSupervisors({ onlyActive: true });

  const recipients = [];
  if (responsable && responsable.email) {
    recipients.push(responsable.email);
  }

  supervisores.forEach((u) => {
    if (u.email && !recipients.includes(u.email)) {
      recipients.push(u.email);
    }
  });

  return recipients;
}
