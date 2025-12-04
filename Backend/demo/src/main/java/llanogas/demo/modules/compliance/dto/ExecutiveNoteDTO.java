package llanogas.demo.modules.compliance.dto;

import java.util.Objects;

public class ExecutiveNoteDTO {

    private String note;

    // Constructor vacío
    public ExecutiveNoteDTO() {
    }

    // Constructor completo
    public ExecutiveNoteDTO(String note) {
        this.note = note;
    }

    // Getter y setter
    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    // equals y hashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        ExecutiveNoteDTO that = (ExecutiveNoteDTO) o;
        return Objects.equals(note, that.note);
    }

    @Override
    public int hashCode() {
        return Objects.hash(note);
    }

    // toString
    @Override
    public String toString() {
        return "ExecutiveNoteDTO{" +
                "note='" + note + '\'' +
                '}';
    }
}
