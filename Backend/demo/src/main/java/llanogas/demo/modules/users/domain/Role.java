package llanogas.demo.modules.users.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Ej: "admin", "responsable_reportes", "supervisor_cumplimiento"
    @Column(nullable = false, unique = true, length = 50)
    private String code;

    // Nombre legible: "Administrador del sistema"
    @Column(nullable = false, length = 150)
    private String name;

    // --- getters & setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
