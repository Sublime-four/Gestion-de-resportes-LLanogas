package llanogas.demo.modules.notifications.web;

import llanogas.demo.modules.notifications.domain.Notification;
import llanogas.demo.modules.notifications.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // GET /api/notifications -> notificaciones no leídas
    @GetMapping
    public List<Notification> getUnread() {
        return notificationService.getUnread();
    }

    // PATCH /api/notifications/read-all -> marcar TODAS como leídas
    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.noContent().build(); // 204
    }

    // PATCH /api/notifications/{id}/read -> marcar UNA como leída
    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.noContent().build(); // 204
    }

    // OPCIONAL: si quieres mantener compatibilidad con el naming viejo,
    // puedes dejar también estos endpoints POST:
    //
    // @PostMapping("/mark-all-read")
    // public void markAllReadLegacy() {
    //     notificationService.markAllAsRead();
    // }
    //
    // @PostMapping("/{id}/read")
    // public void markReadLegacy(@PathVariable Long id) {
    //     notificationService.markAsRead(id);
    // }
}
