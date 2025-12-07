package llanogas.demo.modules.reports.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

/**
 * DTO usado cuando se importan reportes desde Excel/CSV.
 * Aquí van los 12 campos requeridos del archivo.
 */
public class ReportImportDto {

    @NotBlank
    private String entidadControl;          // Entidad

    @NotBlank
    private String nombreReporte;           // Nombre del reporte

    @NotBlank
    private String informacionContenido;    // Información que contiene el reporte

    @NotBlank
    private String frecuencia;              // Periodicidad del reporte

    @NotBlank
    private String cargoResponsableEnvio;   // Cargo Responsable del envío

    @NotBlank
    private String responsableElaboracionName; // Nombre del responsable del envío

    @NotBlank
    @Email
    private String emailResponsableEnvio;   // Correo del responsable del envío

    @NotBlank
    private String responsableSupervisionName; // Nombre del Líder seguimiento

    @NotBlank
    @Email
    private String emailLiderSeguimiento;   // Correo del Líder seguimiento

    @NotBlank
    private String gerenciaResponsable;     // Gerencia Responsable

    @NotBlank
    private String baseLegal;               // Marco Legal

    @NotNull
    private LocalDate fechaLimiteEnvio;     // Fecha Límite de Envío

    // Extras que también manda el front en import
    private LocalDate fechaInicio;
    private String telefonoResponsable;
    private String correosNotificacion;

    // Getters / setters
    public String getEntidadControl() { return entidadControl; }
    public void setEntidadControl(String entidadControl) { this.entidadControl = entidadControl; }

    public String getNombreReporte() { return nombreReporte; }
    public void setNombreReporte(String nombreReporte) { this.nombreReporte = nombreReporte; }

    public String getInformacionContenido() { return informacionContenido; }
    public void setInformacionContenido(String informacionContenido) { this.informacionContenido = informacionContenido; }

    public String getFrecuencia() { return frecuencia; }
    public void setFrecuencia(String frecuencia) { this.frecuencia = frecuencia; }

    public String getCargoResponsableEnvio() { return cargoResponsableEnvio; }
    public void setCargoResponsableEnvio(String cargoResponsableEnvio) { this.cargoResponsableEnvio = cargoResponsableEnvio; }

    public String getResponsableElaboracionName() { return responsableElaboracionName; }
    public void setResponsableElaboracionName(String responsableElaboracionName) { this.responsableElaboracionName = responsableElaboracionName; }

    public String getEmailResponsableEnvio() { return emailResponsableEnvio; }
    public void setEmailResponsableEnvio(String emailResponsableEnvio) { this.emailResponsableEnvio = emailResponsableEnvio; }

    public String getResponsableSupervisionName() { return responsableSupervisionName; }
    public void setResponsableSupervisionName(String responsableSupervisionName) { this.responsableSupervisionName = responsableSupervisionName; }

    public String getEmailLiderSeguimiento() { return emailLiderSeguimiento; }
    public void setEmailLiderSeguimiento(String emailLiderSeguimiento) { this.emailLiderSeguimiento = emailLiderSeguimiento; }

    public String getGerenciaResponsable() { return gerenciaResponsable; }
    public void setGerenciaResponsable(String gerenciaResponsable) { this.gerenciaResponsable = gerenciaResponsable; }

    public String getBaseLegal() { return baseLegal; }
    public void setBaseLegal(String baseLegal) { this.baseLegal = baseLegal; }

    public LocalDate getFechaLimiteEnvio() { return fechaLimiteEnvio; }
    public void setFechaLimiteEnvio(LocalDate fechaLimiteEnvio) { this.fechaLimiteEnvio = fechaLimiteEnvio; }

    public LocalDate getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDate fechaInicio) { this.fechaInicio = fechaInicio; }

    public String getTelefonoResponsable() { return telefonoResponsable; }
    public void setTelefonoResponsable(String telefonoResponsable) { this.telefonoResponsable = telefonoResponsable; }

    public String getCorreosNotificacion() { return correosNotificacion; }
    public void setCorreosNotificacion(String correosNotificacion) { this.correosNotificacion = correosNotificacion; }
}
