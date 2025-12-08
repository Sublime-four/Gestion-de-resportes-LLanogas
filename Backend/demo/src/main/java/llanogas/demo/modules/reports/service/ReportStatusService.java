package llanogas.demo.modules.reports.service;

import llanogas.demo.modules.reports.domain.Report;
import llanogas.demo.modules.reports.domain.ReportStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Servicio que replica en backend la misma lógica de estado
 * que usa el front para los reportes:
 *
 * - "Dentro del plazo"  -> hoy <= due y SIN acuse
 * - "Pendiente"         -> due < hoy <= due+2 días y SIN acuse
 * - "Vencido"           -> hoy > due+2 días y SIN acuse
 *
 * Importante:
 *  - La "fecha de vencimiento" se resuelve primero con fechaInicio,
 *    y si está vacía, se usa fechaLimiteEnvio (igual que el front
 *    en MyTasks.jsx ahora mismo).
 *  - De momento el backend no mira acuses todavía; asume que no existen.
 */
@Service
public class ReportStatusService {

    /**
     * Calcula el estado a la fecha de hoy.
     */
    public ReportStatus calculateStatus(Report report) {
        return calculateStatus(report, LocalDate.now());
    }

    /**
     * Calcula el estado usando una fecha de referencia (útil para tests
     * o para el scheduler).
     */
    public ReportStatus calculateStatus(Report report, LocalDate today) {
        if (report == null) {
            return ReportStatus.DENTRO_DEL_PLAZO;
        }

        if (today == null) {
            today = LocalDate.now();
        }

        LocalDate due = resolveDueDate(report);

        // Si no hay fecha de vencimiento, lo consideramos dentro del plazo
        if (due == null) {
            return ReportStatus.DENTRO_DEL_PLAZO;
        }

        // Ventana de gracia de 2 días (igual que el front)
        LocalDate extended = due.plusDays(2);

        // Sin acuse en backend todavía, sólo comparamos hoy vs due/extended
        if (!today.isAfter(due)) {
            // hoy <= due
            return ReportStatus.DENTRO_DEL_PLAZO;
        }

        if (today.isAfter(due) && !today.isAfter(extended)) {
            // due < hoy <= due+2
            return ReportStatus.PENDIENTE;
        }

        // hoy > due+2
        return ReportStatus.VENCIDO;
    }

    /**
     * Resuelve la "fecha de vencimiento" del reporte.
     * Imitamos al front:
     *  - primero fechaInicio
     *  - si no hay, fechaLimiteEnvio
     */
    public LocalDate resolveDueDate(Report report) {
        if (report == null) {
            return null;
        }

        LocalDate due = report.getFechaInicio();
        if (due != null) {
            return due;
        }

        return report.getFechaLimiteEnvio();
    }


    public Long daysUntilDue(Report report, LocalDate today) {
        LocalDate due = resolveDueDate(report);
        if (due == null) {
            return null;
        }
        if (today == null) {
            today = LocalDate.now();
        }
        return ChronoUnit.DAYS.between(today, due);
    }


    public boolean aboutToExpire(Report report, LocalDate today, int daysThreshold) {
        Long days = daysUntilDue(report, today);
        if (days == null) {
            return false;
        }
        // >= 0  y <= daysThreshold  => aún no vencido, pero ya cerca
        return days >= 0 && days <= daysThreshold;
    }
}
