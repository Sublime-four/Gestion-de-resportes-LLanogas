package llanogas.demo.modules.compliance.dto;

import java.util.Objects;

public class ResponsableMetricDTO {

    private String nombre;
    private Integer cumplimiento;

    // Constructor vacío
    public ResponsableMetricDTO() {
    }

    // Constructor completo (el que usas en el service)
    public ResponsableMetricDTO(String nombre, Integer cumplimiento) {
        this.nombre = nombre;
        this.cumplimiento = cumplimiento;
    }

    // Getters y setters
    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
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
        ResponsableMetricDTO that = (ResponsableMetricDTO) o;
        return Objects.equals(nombre, that.nombre) &&
               Objects.equals(cumplimiento, that.cumplimiento);
    }

    @Override
    public int hashCode() {
        return Objects.hash(nombre, cumplimiento);
    }

    @Override
    public String toString() {
        return "ResponsableMetricDTO{" +
                "nombre='" + nombre + '\'' +
                ", cumplimiento=" + cumplimiento +
                '}';
    }
}
