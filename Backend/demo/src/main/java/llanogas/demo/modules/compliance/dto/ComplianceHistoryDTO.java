package llanogas.demo.modules.compliance.dto;

import java.util.Objects;

public class ComplianceHistoryDTO {

    private String periodo;
    private Integer cumplimiento;

    // Constructor vacío
    public ComplianceHistoryDTO() {
    }

    // Constructor completo
    public ComplianceHistoryDTO(String periodo, Integer cumplimiento) {
        this.periodo = periodo;
        this.cumplimiento = cumplimiento;
    }

    // Getters y setters
    public String getPeriodo() {
        return periodo;
    }

    public void setPeriodo(String periodo) {
        this.periodo = periodo;
    }

    public Integer getCumplimiento() {
        return cumplimiento;
    }

    public void setCumplimiento(Integer cumplimiento) {
        this.cumplimiento = cumplimiento;
    }

    // equals y hashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        ComplianceHistoryDTO that = (ComplianceHistoryDTO) o;
        return Objects.equals(periodo, that.periodo) &&
               Objects.equals(cumplimiento, that.cumplimiento);
    }

    @Override
    public int hashCode() {
        return Objects.hash(periodo, cumplimiento);
    }

    // toString
    @Override
    public String toString() {
        return "ComplianceHistoryDTO{" +
                "periodo='" + periodo + '\'' +
                ", cumplimiento=" + cumplimiento +
                '}';
    }
}
