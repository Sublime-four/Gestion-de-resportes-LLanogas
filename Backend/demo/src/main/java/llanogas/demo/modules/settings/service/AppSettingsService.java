package llanogas.demo.modules.settings.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import llanogas.demo.modules.settings.domain.AppSettings;
import llanogas.demo.modules.settings.dto.SettingsResponseDto;
import llanogas.demo.modules.settings.dto.SettingsUpdateRequest;
import llanogas.demo.modules.settings.repository.AppSettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AppSettingsService {

    private final AppSettingsRepository repository;
    private final ObjectMapper objectMapper;

    private static final Map<String, Object> DEFAULT_CONFIG = Map.of(
            "emailNotifications", false,
            "requireApproval", false,
            "complianceTarget", 0
    );

    public AppSettingsService(AppSettingsRepository repository,
                              ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public SettingsResponseDto getSettings() {
        Optional<AppSettings> opt = repository.findById(1L);

        if (opt.isEmpty() || opt.get().getConfigJson() == null) {
            return new SettingsResponseDto(new HashMap<>(DEFAULT_CONFIG));
        }

        String rawJson = opt.get().getConfigJson();
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> cfg = objectMapper.readValue(rawJson, Map.class);

            Map<String, Object> merged = new HashMap<>(DEFAULT_CONFIG);
            if (cfg != null) {
                merged.putAll(cfg);
            }

            return new SettingsResponseDto(merged);
        } catch (JsonProcessingException e) {
            return new SettingsResponseDto(new HashMap<>(DEFAULT_CONFIG));
        }
    }

    @Transactional
    public void updateSettings(SettingsUpdateRequest request) {
        Map<String, Object> cfg = request.getConfigJson();
        if (cfg == null) {
            cfg = new HashMap<>(DEFAULT_CONFIG);
        }

        try {
            String json = objectMapper.writeValueAsString(cfg);

            AppSettings entity = repository.findById(1L)
                    .orElseGet(() -> new AppSettings(1L, null));

            entity.setConfigJson(json);
            repository.save(entity);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error serializando configuración", e);
        }
    }
}
