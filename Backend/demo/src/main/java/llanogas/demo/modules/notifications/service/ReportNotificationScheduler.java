package llanogas.demo.modules.notifications.service;

import llanogas.demo.modules.notifications.repository.NotificationRepository;
import llanogas.demo.modules.reports.domain.Report;
import llanogas.demo.modules.reports.domain.ReportStatus;
import llanogas.demo.modules.reports.repository.ReportRepository;
import llanogas.demo.modules.reports.service.ReportStatusService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class ReportNotificationScheduler {

    private final ReportRepository reportRepository;
    private final ReportStatusService reportStatusService;
    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;

    public ReportNotificationScheduler(
            ReportRepository reportRepository,
            ReportStatusService reportStatusService,
            NotificationService notificationService,
            NotificationRepository notificationRepository
    ) {
        this.reportRepository = reportRepository;
        this.reportStatusService = reportStatusService;
        this.notificationService = notificationService;
        this.notificationRepository = notificationRepository;
    }

    /**
     * MODO DESARROLLO:
     *  - Se ejecuta cada 60 segundos para que puedas ver las notificaciones
     *    aparecer sin esperar al día siguiente.
     *
     * PARA PRODUCCIÓN:
     *  - Cambia la anotación a:
     *      @Scheduled(cron = "0 0 8 * * *")
     */
    @Scheduled(fixedDelay = 60_000) // cada 60s después de terminar la ejecución
    // @Scheduled(cron = "0 0 8 * * *")  // ← usar en producción
    public void checkReports() {
        LocalDate today = LocalDate.now();
        System.out.println("[Scheduler] Revisando reportes para fecha " + today);

        List<Report> reports = reportRepository.findAll();

        for (Report report : reports) {
            LocalDate due = reportStatusService.resolveDueDate(report);
            if (due == null) {
                continue;
            }

            ReportStatus status = reportStatusService.calculateStatus(report, today);
            Long daysUntilDue = reportStatusService.daysUntilDue(report, today);

            // 1) Próximo a vencer (0–2 días antes)
            if (daysUntilDue != null && daysUntilDue >= 0 && daysUntilDue <= 2) {
                createNotificationIfNotExistsForToday(
                        report,
                        "PROXIMO_VENCER",
                        "Reporte próximo a vencer",
                        "El reporte '" + report.getNombreReporte() +
                                "' vence el " + due + ".",
                        due,
                        today
                );
            }

            // 2) Pendiente (dentro de los 2 días de gracia)
            if (status == ReportStatus.PENDIENTE) {
                createNotificationIfNotExistsForToday(
                        report,
                        "PENDIENTE",
                        "Reporte en período de gracia",
                        "El reporte '" + report.getNombreReporte() +
                                "' está en período de gracia (2 días después del vencimiento).",
                        due,
                        today
                );
            }

            // 3) Vencido
            if (status == ReportStatus.VENCIDO) {
                createNotificationIfNotExistsForToday(
                        report,
                        "VENCIDO",
                        "Reporte vencido",
                        "El reporte '" + report.getNombreReporte() +
                                "' se encuentra vencido.",
                        due,
                        today
                );
            }
        }
    }

    private void createNotificationIfNotExistsForToday(
            Report report,
            String type,
            String title,
            String message,
            LocalDate fechaVencimiento,
            LocalDate today
    ) {
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);

        boolean exists = notificationRepository
                .existsByReportIdAndTypeAndCreatedAtBetween(
                        report.getId(),
                        type,
                        startOfDay,
                        endOfDay
                );

        if (!exists) {
            System.out.println("[Scheduler] Creando notificación " + type +
                    " para reporte " + report.getId() + " (" + report.getNombreReporte() + ")");

            notificationService.createNotification(
                    report.getId(),
                    type,
                    title,
                    message,
                    fechaVencimiento
            );
        } else {
            System.out.println("[Scheduler] Ya existe notificación " + type +
                    " para hoy y reporte " + report.getId());
        }
    }
}
