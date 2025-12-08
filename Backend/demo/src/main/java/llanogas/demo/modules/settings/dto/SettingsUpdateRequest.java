package llanogas.demo.modules.settings.dto;

import java.util.Map;

public class SettingsUpdateRequest {

    private Map<String, Object> configJson;

    public SettingsUpdateRequest() {}

    public SettingsUpdateRequest(Map<String, Object> configJson) {
        this.configJson = configJson;
    }

    public Map<String, Object> getConfigJson() {
        return configJson;
    }

    public void setConfigJson(Map<String, Object> configJson) {
        this.configJson = configJson;
    }
}
