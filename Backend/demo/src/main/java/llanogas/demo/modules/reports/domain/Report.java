package llanogas.demo.modules.reports.domain;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "reports")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ID funcional que digita el usuario (REP001, etc.)
    @Column(name = "id_reporte", length = 50)
    private String idReporte;

    @Column(name = "nombre_reporte", nullable = false)
    private String nombreReporte;

    @Column(name = "entidad_control", nullable = false)
    private String entidadControl;

    @Column(name = "informacion_contenido", columnDefinition = "TEXT")
    private String informacionContenido;

    @Column(name = "frecuencia", nullable = false, length = 20)
    private String frecuencia; // Mensual, Trimestral, etc.

    @Column(name = "cargo_responsable_envio")
    private String cargoResponsableEnvio;

    @Column(name = "responsable_elaboracion_nombre")
    private String responsableElaboracionName;

    @Column(name = "responsable_elaboracion_cc")
    private String responsableElaboracionCC;

    @Column(name = "responsable_supervision_nombre")
    private String responsableSupervisionName;

    @Column(name = "responsable_supervision_cc")
    private String responsableSupervisionCC;

    @Column(name = "telefono_responsable")
    private String telefonoResponsable;

    @Column(name = "correos_notificacion", columnDefinition = "TEXT")
    private String correosNotificacion;

    @Column(name = "email_responsable_envio")
    private String emailResponsableEnvio;

    @Column(name = "email_lider_seguimiento")
    private String emailLiderSeguimiento;

    @Column(name = "gerencia_responsable")
    private String gerenciaResponsable;

    @Column(name = "base_legal", columnDefinition = "TEXT")
    private String baseLegal;

    @Column(name = "fecha_inicio")
    private LocalDate fechaInicio;

    @Column(name = "fecha_limite_envio")
    private LocalDate fechaLimiteEnvio;

    // ================== NUEVO: asignación a usuarios ==================

    /**
     * Usuario responsable de la elaboración (FK a users.id).
     * Es el que verá el reporte en "Mis Tareas".
     */
    @Column(name = "responsable_elaboracion_user_id")
    private Long responsableElaboracionUserId;

    /**
     * Usuario responsable de la supervisión / cumplimiento (FK a users.id).
     * También podrá ver el reporte en "Mis Tareas".
     */
    @Column(name = "supervisor_cumplimiento_user_id")
    private Long supervisorCumplimientoUserId;

    // ===== Getters / setters =====
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getIdReporte() { return idReporte; }
    public void setIdReporte(String idReporte) { this.idReporte = idReporte; }

    public String getNombreReporte() { return nombreReporte; }
    public void setNombreReporte(String nombreReporte) { this.nombreReporte = nombreReporte; }

    public String getEntidadControl() { return entidadControl; }
    public void setEntidadControl(String entidadControl) { this.entidadControl = entidadControl; }

    public String getInformacionContenido() { return informacionContenido; }
    public void setInformacionContenido(String informacionContenido) { this.informacionContenido = informacionContenido; }

    public String getFrecuencia() { return frecuencia; }
    public void setFrecuencia(String frecuencia) { this.frecuencia = frecuencia; }

    public String getCargoResponsableEnvio() { return cargoResponsableEnvio; }
    public void setCargoResponsableEnvio(String cargoResponsableEnvio) { this.cargoResponsableEnvio = cargoResponsableEnvio; }

    public String getResponsableElaboracionName() { return responsableElaboracionName; }
    public void setResponsableElaboracionName(String responsableElaboracionName) { this.responsableElaboracionName = responsableElaboracionName; }

    public String getResponsableElaboracionCC() { return responsableElaboracionCC; }
    public void setResponsableElaboracionCC(String responsableElaboracionCC) { this.responsableElaboracionCC = responsableElaboracionCC; }

    public String getResponsableSupervisionName() { return responsableSupervisionName; }
    public void setResponsableSupervisionName(String responsableSupervisionName) { this.responsableSupervisionName = responsableSupervisionName; }

    public String getResponsableSupervisionCC() { return responsableSupervisionCC; }
    public void setResponsableSupervisionCC(String responsableSupervisionCC) { this.responsableSupervisionCC = responsableSupervisionCC; }

    public String getTelefonoResponsable() { return telefonoResponsable; }
    public void setTelefonoResponsable(String telefonoResponsable) { this.telefonoResponsable = telefonoResponsable; }

    public String getCorreosNotificacion() { return correosNotificacion; }
    public void setCorreosNotificacion(String correosNotificacion) { this.correosNotificacion = correosNotificacion; }

    public String getEmailResponsableEnvio() { return emailResponsableEnvio; }
    public void setEmailResponsableEnvio(String emailResponsableEnvio) { this.emailResponsableEnvio = emailResponsableEnvio; }

    public String getEmailLiderSeguimiento() { return emailLiderSeguimiento; }
    public void setEmailLiderSeguimiento(String emailLiderSeguimiento) { this.emailLiderSeguimiento = emailLiderSeguimiento; }

    public String getGerenciaResponsable() { return gerenciaResponsable; }
    public void setGerenciaResponsable(String gerenciaResponsable) { this.gerenciaResponsable = gerenciaResponsable; }

    public String getBaseLegal() { return baseLegal; }
    public void setBaseLegal(String baseLegal) { this.baseLegal = baseLegal; }

    public LocalDate getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDate fechaInicio) { this.fechaInicio = fechaInicio; }

    public LocalDate getFechaLimiteEnvio() { return fechaLimiteEnvio; }
    public void setFechaLimiteEnvio(LocalDate fechaLimiteEnvio) { this.fechaLimiteEnvio = fechaLimiteEnvio; }

    public Long getResponsableElaboracionUserId() { return responsableElaboracionUserId; }
    public void setResponsableElaboracionUserId(Long responsableElaboracionUserId) {
        this.responsableElaboracionUserId = responsableElaboracionUserId;
    }

    public Long getSupervisorCumplimientoUserId() { return supervisorCumplimientoUserId; }
    public void setSupervisorCumplimientoUserId(Long supervisorCumplimientoUserId) {
        this.supervisorCumplimientoUserId = supervisorCumplimientoUserId;
    }
}
