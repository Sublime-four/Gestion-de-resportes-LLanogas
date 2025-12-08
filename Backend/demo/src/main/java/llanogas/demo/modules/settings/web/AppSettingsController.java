package llanogas.demo.modules.settings.web;

import llanogas.demo.modules.settings.dto.SettingsResponseDto;
import llanogas.demo.modules.settings.dto.SettingsUpdateRequest;
import llanogas.demo.modules.settings.service.AppSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
public class AppSettingsController {

    private final AppSettingsService service;

    public AppSettingsController(AppSettingsService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<SettingsResponseDto> getSettings() {
        SettingsResponseDto dto = service.getSettings();
        return ResponseEntity.ok(dto);
    }

    @PutMapping
    public ResponseEntity<Void> updateSettings(@RequestBody SettingsUpdateRequest request) {
        service.updateSettings(request);
        return ResponseEntity.noContent().build();
    }
}
