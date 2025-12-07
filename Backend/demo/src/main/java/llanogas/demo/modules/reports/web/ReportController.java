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

    @PostMapping("/import")
    public ResponseEntity<List<ReportDto>> importReports(
            @Valid @RequestBody List<ReportImportDto> importDtos) {

        List<ReportDto> saved = reportService.importReports(importDtos);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping
    public ResponseEntity<ReportDto> createReport(
            @Valid @RequestBody ReportCreateDto createDto) {

        ReportDto saved = reportService.createReport(createDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping
    public List<ReportDto> getAll() {
        return reportService.findAll();
    }

    // 🔥 NUEVO: eliminar reporte por id
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReport(@PathVariable Long id) {
        reportService.deleteReport(id);
        return ResponseEntity.noContent().build(); // 204
    }
}