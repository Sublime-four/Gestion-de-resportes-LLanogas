package llanogas.demo.modules.compliance.dto;

import java.util.Objects;

public class RiskSummaryDTO {

    private Integer critico;
    private Integer alto;
    private Integer medio;
    private Integer bajo;
    private Integer total;

    // Constructor vacío
    public RiskSummaryDTO() {
    }

    // Constructor completo (el que usas en el service)
    public RiskSummaryDTO(Integer critico, Integer alto, Integer medio, Integer bajo, Integer total) {
        this.critico = critico;
        this.alto = alto;
        this.medio = medio;
        this.bajo = bajo;
        this.total = total;
    }

    // Getters y setters
    public Integer getCritico() {
        return critico;
    }

    public void setCritico(Integer critico) {
        this.critico = critico;
    }

    public Integer getAlto() {
        return alto;
    }

    public void setAlto(Integer alto) {
        this.alto = alto;
    }

    public Integer getMedio() {
        return medio;
    }

    public void setMedio(Integer medio) {
        this.medio = medio;
    }

    public Integer getBajo() {
        return bajo;
    }

    public void setBajo(Integer bajo) {
        this.bajo = bajo;
    }

    public Integer getTotal() {
        return total;
    }

    public void setTotal(Integer total) {
        this.total = total;
    }

    // equals y hashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RiskSummaryDTO that = (RiskSummaryDTO) o;
        return Objects.equals(critico, that.critico) &&
               Objects.equals(alto, that.alto) &&
               Objects.equals(medio, that.medio) &&
               Objects.equals(bajo, that.bajo) &&
               Objects.equals(total, that.total);
    }

    @Override
    public int hashCode() {
        return Objects.hash(critico, alto, medio, bajo, total);
    }

    @Override
    public String toString() {
        return "RiskSummaryDTO{" +
                "critico=" + critico +
                ", alto=" + alto +
                ", medio=" + medio +
                ", bajo=" + bajo +
                ", total=" + total +
                '}';
    }
}
