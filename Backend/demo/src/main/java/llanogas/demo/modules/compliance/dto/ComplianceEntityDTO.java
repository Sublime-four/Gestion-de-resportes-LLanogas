package llanogas.demo.modules.compliance.dto;

import java.util.Objects;

public class ComplianceEntityDTO {

    private String entidad;
    private Integer tiempo;
    private Integer pendientes;
    private Integer vencidos;
    private Integer fueraDeTiempo;
    private String riesgo;
    private Integer cumplimiento;
    private Double diasRetrasoPromedio;

    // Constructor vacío
    public ComplianceEntityDTO() {
    }

    // Constructor completo
    public ComplianceEntityDTO(
            String entidad,
            Integer tiempo,
            Integer pendientes,
            Integer vencidos,
            Integer fueraDeTiempo,
            String riesgo,
            Integer cumplimiento,
            Double diasRetrasoPromedio) {

        this.entidad = entidad;
        this.tiempo = tiempo;
        this.pendientes = pendientes;
        this.vencidos = vencidos;
        this.fueraDeTiempo = fueraDeTiempo;
        this.riesgo = riesgo;
        this.cumplimiento = cumplimiento;
        this.diasRetrasoPromedio = diasRetrasoPromedio;
    }

    // Getters y setters
    public String getEntidad() {
        return entidad;
    }

    public void setEntidad(String entidad) {
        this.entidad = entidad;
    }

    public Integer getTiempo() {
        return tiempo;
    }

    public void setTiempo(Integer tiempo) {
        this.tiempo = tiempo;
    }

    public Integer getPendientes() {
        return pendientes;
    }

    public void setPendientes(Integer pendientes) {
        this.pendientes = pendientes;
    }

    public Integer getVencidos() {
        return vencidos;
    }

    public void setVencidos(Integer vencidos) {
        this.vencidos = vencidos;
    }

    public Integer getFueraDeTiempo() {
        return fueraDeTiempo;
    }

    public void setFueraDeTiempo(Integer fueraDeTiempo) {
        this.fueraDeTiempo = fueraDeTiempo;
    }

    public String getRiesgo() {
        return riesgo;
    }

    public void setRiesgo(String riesgo) {
        this.riesgo = riesgo;
    }

    public Integer getCumplimiento() {
        return cumplimiento;
    }

    public void setCumplimiento(Integer cumplimiento) {
        this.cumplimiento = cumplimiento;
    }

    public Double getDiasRetrasoPromedio() {
        return diasRetrasoPromedio;
    }

    public void setDiasRetrasoPromedio(Double diasRetrasoPromedio) {
        this.diasRetrasoPromedio = diasRetrasoPromedio;
    }

    // equals y hashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        ComplianceEntityDTO that = (ComplianceEntityDTO) o;
        return Objects.equals(entidad, that.entidad) &&
               Objects.equals(tiempo, that.tiempo) &&
               Objects.equals(pendientes, that.pendientes) &&
               Objects.equals(vencidos, that.vencidos) &&
               Objects.equals(fueraDeTiempo, that.fueraDeTiempo) &&
               Objects.equals(riesgo, that.riesgo) &&
               Objects.equals(cumplimiento, that.cumplimiento) &&
               Objects.equals(diasRetrasoPromedio, that.diasRetrasoPromedio);
    }

    @Override
    public int hashCode() {
        return Objects.hash(entidad, tiempo, pendientes, vencidos, fueraDeTiempo,
                riesgo, cumplimiento, diasRetrasoPromedio);
    }

    // toString
    @Override
    public String toString() {
        return "ComplianceEntityDTO{" +
                "entidad='" + entidad + '\'' +
                ", tiempo=" + tiempo +
                ", pendientes=" + pendientes +
                ", vencidos=" + vencidos +
                ", fueraDeTiempo=" + fueraDeTiempo +
                ", riesgo='" + riesgo + '\'' +
                ", cumplimiento=" + cumplimiento +
                ", diasRetrasoPromedio=" + diasRetrasoPromedio +
                '}';
    }
}
