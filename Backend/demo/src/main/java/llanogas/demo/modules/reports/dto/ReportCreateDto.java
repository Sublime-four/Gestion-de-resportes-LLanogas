package llanogas.demo.modules.reports.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

/**
 * DTO para creación manual vía formulario (nuevo reporte).
 */
public class ReportCreateDto {

    @NotBlank
    private String idReporte;

    @NotBlank
    private String nombreReporte;

    private String entidadControl;

    private String baseLegal;

    @NotNull
    private LocalDate fechaInicio;

    private String responsableElaboracionName;
    private String responsableElaboracionCC;

    private String responsableSupervisionName;
    private String responsableSupervisionCC;

    private String telefonoResponsable;

    private String correosNotificacion;

    @NotBlank
    private String frecuencia; // Mensual, Trimestral, etc.

    // Getters / setters
    public String getIdReporte() { return idReporte; }
    public void setIdReporte(String idReporte) { this.idReporte = idReporte; }

    public String getNombreReporte() { return nombreReporte; }
    public void setNombreReporte(String nombreReporte) { this.nombreReporte = nombreReporte; }

    public String getEntidadControl() { return entidadControl; }
    public void setEntidadControl(String entidadControl) { this.entidadControl = entidadControl; }

    public String getBaseLegal() { return baseLegal; }
    public void setBaseLegal(String baseLegal) { this.baseLegal = baseLegal; }

    public LocalDate getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDate fechaInicio) { this.fechaInicio = fechaInicio; }

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

    public String getFrecuencia() { return frecuencia; }
    public void setFrecuencia(String frecuencia) { this.frecuencia = frecuencia; }
}
