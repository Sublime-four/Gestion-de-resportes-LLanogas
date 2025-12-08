package llanogas.demo.modules.notifications.repository;

import llanogas.demo.modules.notifications.domain.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Todas las notificaciones ordenadas por fecha (más nuevas primero)
    List<Notification> findAllByOrderByCreatedAtDesc();

    // Solo no leídas (para el badge de la campanita)
    List<Notification> findByReadFalseOrderByCreatedAtDesc();

    // Para que el scheduler no duplique notificaciones en el mismo día
    boolean existsByReportIdAndTypeAndCreatedAtBetween(
            Long reportId,
            String type,
            LocalDateTime startOfDay,
            LocalDateTime endOfDay
    );
}
