package llanogas.demo.modules.reports.web;

import llanogas.demo.modules.reports.dto.ReportCreateDto;
import llanogas.demo.modules.reports.dto.ReportDto;
import llanogas.demo.modules.reports.dto.ReportImportDto;
import llanogas.demo.modules.reports.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    // ================== IMPORTACIÓN DESDE EXCEL ==================

    @PostMapping("/import")
    public ResponseEntity<List<ReportDto>> importReports(
            @Valid @RequestBody List<ReportImportDto> importDtos) {

        List<ReportDto> saved = reportService.importReports(importDtos);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // ================== CREACIÓN MANUAL ==================

    @PostMapping
    public ResponseEntity<ReportDto> createReport(
            @Valid @RequestBody ReportCreateDto createDto) {

        ReportDto saved = reportService.createReport(createDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // ================== LISTADO GENERAL ==================

    @GetMapping
    public List<ReportDto> getAll() {
        return reportService.findAll();
    }

    // 🔥 "Mis tareas": sólo reportes asignados a un usuario
    @GetMapping("/my-tasks")
    public List<ReportDto> getMyTasks(@RequestParam("userId") Long userId) {
        return reportService.findByAssignedUser(userId);
    }

    // ================== ELIMINAR ==================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReport(@PathVariable Long id) {
        reportService.deleteReport(id);
        return ResponseEntity.noContent().build(); // 204
    }

    // ================== ACTUALIZAR ==================
    // OJO: aquí ya NO usamos @Valid para no reventar cuando
    // algunos campos (como idReporte) vienen nulos en updates.

    @PutMapping("/{id}")
    public ResponseEntity<ReportDto> updateReport(
            @PathVariable Long id,
            @RequestBody ReportCreateDto dto
    ) {
        ReportDto updated = reportService.updateReport(id, dto);
        return ResponseEntity.ok(updated);
    }
}
