package llanogas.demo.modules.notifications.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import llanogas.demo.modules.notifications.domain.Notification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
public class NotificationEmailSender {

    private static final Logger log = LoggerFactory.getLogger(NotificationEmailSender.class);

    private final JavaMailSender mailSender;

    // Remitente por defecto
    @Value("${notifications.mail.from:no-reply@llanogas.local}")
    private String fromAddress;

    // Destinatario por defecto (puede ser una lista separada por comas)
    @Value("${notifications.mail.to:soporte@llanogas.local}")
    private String defaultToAddress;

    public NotificationEmailSender(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendNotificationEmail(Notification notification) {
        if (notification == null) {
            log.warn("[EMAIL] Notificación nula, nada que enviar");
            return;
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();

            MimeMessageHelper helper = new MimeMessageHelper(
                    mimeMessage,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name()
            );

            // Aquí podrías usar un email dinámico si tu Notification lo tiene, ej:
            // String to = notification.getEmailDestino();
            String to = defaultToAddress;

            String subject = buildSubject(notification);
            String bodyHtml = buildHtmlBody(notification);

            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(bodyHtml, true); // true = HTML

            mailSender.send(mimeMessage);

            log.info(
                    "[EMAIL] Correo ENVIADO para notificación id={} type={} reportId={} to={}",
                    notification.getId(),
                    notification.getType(),
                    notification.getReportId(),
                    to
            );

        } catch (MessagingException e) {
            log.error(
                    "[EMAIL] Error construyendo el correo para notificación id={}: {}",
                    notification.getId(), e.getMessage(), e
            );
            throw new RuntimeException("Error construyendo el correo de notificación", e);
        } catch (Exception e) {
            log.error(
                    "[EMAIL] Error enviando el correo para notificación id={}: {}",
                    notification.getId(), e.getMessage(), e
            );
            throw new RuntimeException("Error enviando el correo de notificación", e);
        }
    }

    private String buildSubject(Notification n) {
        // Ejemplo: [LLANOGAS] Aviso VENCIMIENTO - Reporte 12345
        return "[LLANOGAS] " + n.getType() + " - Reporte " + n.getReportId();
    }

    private String buildHtmlBody(Notification n) {
        StringBuilder sb = new StringBuilder();

        sb.append("<html><body>");
        sb.append("<h3>").append(escape(n.getNombre())).append("</h3>");
        sb.append("<p>").append(escape(n.getMessage())).append("</p>");

        sb.append("<hr/>");
        sb.append("<p><b>Reporte:</b> ").append(n.getReportId()).append("</p>");
        sb.append("<p><b>Tipo:</b> ").append(escape(n.getType())).append("</p>");
        sb.append("<p><b>Fecha de vencimiento:</b> ").append(n.getFechaVencimiento()).append("</p>");
        sb.append("<p><b>Código de notificación:</b> ").append(escape(n.getCode())).append("</p>");

        sb.append("<br/>");
        sb.append("<p>Este es un correo generado automáticamente, por favor no responda.</p>");
        sb.append("</body></html>");

        return sb.toString();
    }

    // Protección básica para evitar HTML raro en campos de texto
    private String escape(String s) {
        if (s == null) return "";
        return s
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;");
    }
}
