package llanogas.demo.modules.settings.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "app_settings")
public class AppSettings {

    @Id
    private Long id = 1L; // único registro

    @Lob
    @Column(name = "config_json")
    private String configJson; // JSON en bruto

    public AppSettings() {}

    public AppSettings(Long id, String configJson) {
        this.id = id;
        this.configJson = configJson;
    }

    public Long getId() {
        return id;
    }

    public String getConfigJson() {
        return configJson;
    }

    public void setConfigJson(String configJson) {
        this.configJson = configJson;
    }
}
