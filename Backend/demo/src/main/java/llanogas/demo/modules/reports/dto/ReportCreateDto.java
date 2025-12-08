package llanogas.demo.modules.reports.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;


public class ReportCreateDto {

    @NotBlank
    private String idReporte;

    @NotBlank
    private String nombreReporte;

    private String entidadControl;
    private String baseLegal;
    private String informacionContenido;

    private String cargoResponsableEnvio;
    private String responsableElaboracionName;
    private String responsableElaboracionCC;

    private String responsableSupervisionName;
    private String responsableSupervisionCC;

    private String telefonoResponsable;
    private String correosNotificacion;

    private String emailResponsableEnvio;
    private String emailLiderSeguimiento;
    private String gerenciaResponsable;

    @NotNull
    private LocalDate fechaInicio;

    private LocalDate fechaLimiteEnvio;

    @NotBlank
    private String frecuencia; // Mensual, Trimestral, etc.

    // Asignación a usuarios (IDs de la tabla users)
    private Long responsableElaboracionUserId;
    private Long supervisorCumplimientoUserId;

    // ===== Getters / setters =====

    public String getIdReporte() { return idReporte; }
    public void setIdReporte(String idReporte) { this.idReporte = idReporte; }

    public String getNombreReporte() { return nombreReporte; }
    public void setNombreReporte(String nombreReporte) { this.nombreReporte = nombreReporte; }

    public String getEntidadControl() { return entidadControl; }
    public void setEntidadControl(String entidadControl) { this.entidadControl = entidadControl; }

    public String getBaseLegal() { return baseLegal; }
    public void setBaseLegal(String baseLegal) { this.baseLegal = baseLegal; }

    public String getInformacionContenido() { return informacionContenido; }
    public void setInformacionContenido(String informacionContenido) {
        this.informacionContenido = informacionContenido;
    }

    public String getCargoResponsableEnvio() { return cargoResponsableEnvio; }
    public void setCargoResponsableEnvio(String cargoResponsableEnvio) {
        this.cargoResponsableEnvio = cargoResponsableEnvio;
    }

    public String getResponsableElaboracionName() { return responsableElaboracionName; }
    public void setResponsableElaboracionName(String responsableElaboracionName) {
        this.responsableElaboracionName = responsableElaboracionName;
    }

    public String getResponsableElaboracionCC() { return responsableElaboracionCC; }
    public void setResponsableElaboracionCC(String responsableElaboracionCC) {
        this.responsableElaboracionCC = responsableElaboracionCC;
    }

    public String getResponsableSupervisionName() { return responsableSupervisionName; }
    public void setResponsableSupervisionName(String responsableSupervisionName) {
        this.responsableSupervisionName = responsableSupervisionName;
    }

    public String getResponsableSupervisionCC() { return responsableSupervisionCC; }
    public void setResponsableSupervisionCC(String responsableSupervisionCC) {
        this.responsableSupervisionCC = responsableSupervisionCC;
    }

    public String getTelefonoResponsable() { return telefonoResponsable; }
    public void setTelefonoResponsable(String telefonoResponsable) {
        this.telefonoResponsable = telefonoResponsable;
    }

    public String getCorreosNotificacion() { return correosNotificacion; }
    public void setCorreosNotificacion(String correosNotificacion) {
        this.correosNotificacion = correosNotificacion;
    }

    public String getEmailResponsableEnvio() { return emailResponsableEnvio; }
    public void setEmailResponsableEnvio(String emailResponsableEnvio) {
        this.emailResponsableEnvio = emailResponsableEnvio;
    }

    public String getEmailLiderSeguimiento() { return emailLiderSeguimiento; }
    public void setEmailLiderSeguimiento(String emailLiderSeguimiento) {
        this.emailLiderSeguimiento = emailLiderSeguimiento;
    }

    public String getGerenciaResponsable() { return gerenciaResponsable; }
    public void setGerenciaResponsable(String gerenciaResponsable) {
        this.gerenciaResponsable = gerenciaResponsable;
    }

    public LocalDate getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDate fechaInicio) { this.fechaInicio = fechaInicio; }

    public LocalDate getFechaLimiteEnvio() { return fechaLimiteEnvio; }
    public void setFechaLimiteEnvio(LocalDate fechaLimiteEnvio) {
        this.fechaLimiteEnvio = fechaLimiteEnvio;
    }

    public String getFrecuencia() { return frecuencia; }
    public void setFrecuencia(String frecuencia) { this.frecuencia = frecuencia; }

    public Long getResponsableElaboracionUserId() { return responsableElaboracionUserId; }
    public void setResponsableElaboracionUserId(Long responsableElaboracionUserId) {
        this.responsableElaboracionUserId = responsableElaboracionUserId;
    }

    public Long getSupervisorCumplimientoUserId() { return supervisorCumplimientoUserId; }
    public void setSupervisorCumplimientoUserId(Long supervisorCumplimientoUserId) {
        this.supervisorCumplimientoUserId = supervisorCumplimientoUserId;
    }
}
