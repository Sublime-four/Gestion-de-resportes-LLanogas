package llanogas.demo.modules.compliance.model;

import java.util.Objects;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "compliance_entities")
public class ComplianceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String entidad;
    private Integer tiempo;
    private Integer pendientes;
    private Integer vencidos;
    private Integer fueraDeTiempo;
    private String riesgo;
    private Integer cumplimiento;
    private Double diasRetrasoPromedio;

    // Constructor vacío (obligatorio para JPA)
    public ComplianceEntity() {
    }

    // Getters y setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    // equals y hashCode basados en ID (recomendado para entidades)
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ComplianceEntity)) return false;
        ComplianceEntity that = (ComplianceEntity) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    // toString seguro (para logs)
    @Override
    public String toString() {
        return "ComplianceEntity{" +
                "id=" + id +
                ", entidad='" + entidad + '\'' +
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
