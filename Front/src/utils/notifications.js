// src/utils/notifications.js

// --- Cálculo de tipo de alerta según días restantes ---
export function getAlertType(daysLeft) {
  if (daysLeft >= 15) return "Verde";             // preventiva
  if (daysLeft >= 6 && daysLeft <= 14) return "Amarilla"; // seguimiento
  if (daysLeft >= 1 && daysLeft <= 5) return "Naranja";   // riesgo
  return "Roja";                                   // crítica / vencido
}

// dd/mm/yyyy
export function formatAlertDate(d) {
  if (!d) return "-";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/**
 * Genera alertas a partir de los reportes almacenados.
 * Espera objetos como los de `reportesCreados` en localStorage:
 *  - id, nombreReporte, nextDue, responsableElaboracionName
 */
export function generateAlertsFromReports(reports = []) {
  const today = new Date();
  const baseToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const alerts = [];

  for (const rep of reports) {
    if (!rep.nextDue) continue;

    const due =
      rep.nextDue instanceof Date
        ? rep.nextDue
        : new Date(rep.nextDue); // viene como string desde localStorage

    if (isNaN(due)) continue;

    const diffMs = due - baseToday;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    const type = getAlertType(diffDays);

    alerts.push({
      id: `alert_${rep.id}`,
      reportId: rep.id,
      nombre: rep.nombreReporte || rep.name || "Reporte sin nombre",
      entidad: rep.entidadControl || rep.entity || "",
      fechaVencimiento: formatAlertDate(due),
      responsable: rep.responsableElaboracionName || "Sin responsable",
      type,          // Verde / Amarilla / Naranja / Roja
      daysLeft: diffDays,
      read: false,
      message: buildMessage(type, rep, diffDays),
    });
  }

  // Orden: primero más críticos y más próximos
  alerts.sort((a, b) => {
    const weight = { Roja: 0, Naranja: 1, Amarilla: 2, Verde: 3 };
    const wa = weight[a.type] ?? 9;
    const wb = weight[b.type] ?? 9;
    if (wa !== wb) return wa - wb;
    return a.daysLeft - b.daysLeft;
  });

  return alerts;
}

function buildMessage(type, rep, daysLeft) {
  const nombre = rep.nombreReporte || rep.name || "Reporte";
  switch (type) {
    case "Verde":
      return `Alerta temprana: "${nombre}" vence en ${daysLeft} día(s).`;
    case "Amarilla":
      return `Seguimiento: "${nombre}" vence en ${daysLeft} día(s). Revisa el avance.`;
    case "Naranja":
      return `Riesgo: "${nombre}" vence en ${daysLeft} día(s). Debe avanzarse hoy.`;
    case "Roja":
      return `Crítica: "${nombre}" está vencido o vence HOY. Acción inmediata requerida.`;
    default:
      return "";
  }
}
