package llanogas.demo.modules.notifications.service;

import llanogas.demo.modules.notifications.domain.Notification;
import llanogas.demo.modules.notifications.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private static final DateTimeFormatter CODE_FMT =
            DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final NotificationRepository notificationRepository;
    private final NotificationEmailSender emailSender; // 👈 inyectamos el sender

    public NotificationService(NotificationRepository notificationRepository,
                               NotificationEmailSender emailSender) {
        this.notificationRepository = notificationRepository;
        this.emailSender = emailSender;
    }

    public List<Notification> getUnread() {
        return notificationRepository.findByReadFalseOrderByCreatedAtDesc();
    }

    public void markAllAsRead() {
        List<Notification> unread = notificationRepository.findByReadFalseOrderByCreatedAtDesc();
        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unread);
    }

    public void markAsRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    // 👉 ESTE ES EL QUE LLAMA EL SCHEDULER
    public Notification createNotification(
            Long reportId,
            String type,
            String title,
            String message,
            LocalDate fechaVencimiento
    ) {
        LocalDateTime now = LocalDateTime.now();

        Notification n = new Notification();
        n.setReportId(reportId);
        n.setType(type);
        n.setNombre(title);
        n.setMessage(message);
        n.setFechaVencimiento(fechaVencimiento);
        n.setCreatedAt(now);
        n.setRead(false);

        // code único por notificación
        String code = type + "-" + reportId + "-" + now.format(CODE_FMT);
        n.setCode(code);

        // cycleKey estable por día: mismo reporte + tipo + fecha
        String cycleKey = type + "-" + reportId + "-" +
                now.toLocalDate().format(DateTimeFormatter.BASIC_ISO_DATE); // 20251208
        n.setCycleKey(cycleKey);

        Notification saved = notificationRepository.save(n);

        // 👇 Disparar correo (sin tumbar el scheduler si falla)
        try {
            emailSender.sendNotificationEmail(saved);
            log.info("[NOTIF] Email enviado para notificación {} tipo {} reporte {}",
                    saved.getId(), type, reportId);
        } catch (Exception e) {
            log.error("[NOTIF] Error enviando email para notificación {}: {}",
                    saved.getId(), e.getMessage(), e);
        }

        return saved;
    }
}
