package llanogas.demo.modules.compliance.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import llanogas.demo.modules.compliance.dto.ComplianceEntityDTO;
import llanogas.demo.modules.compliance.dto.ComplianceHistoryDTO;
import llanogas.demo.modules.compliance.dto.ResponsableMetricDTO;
import llanogas.demo.modules.compliance.dto.RiskSummaryDTO;
import llanogas.demo.modules.compliance.service.ComplianceService;

@RestController
@RequestMapping("/api/compliance")
@CrossOrigin(origins = "*")
public class ComplianceController {

    private final ComplianceService service;

    // Constructor explícito en vez de @RequiredArgsConstructor
    public ComplianceController(ComplianceService service) {
        this.service = service;
    }

    @GetMapping("/entities")
    public List<ComplianceEntityDTO> getEntities() {
        return service.getEntities();
    }

    @GetMapping("/risk-summary")
    public RiskSummaryDTO getRiskSummary() {
        return service.getRiskSummary();
    }

    @GetMapping("/executive-notes")
    public List<String> getExecutiveNotes() {
        return service.getExecutiveNotes();
    }

    @GetMapping("/history")
    public List<ComplianceHistoryDTO> getHistory() {
        return service.getHistory();
    }

    @GetMapping("/responsables")
    public List<ResponsableMetricDTO> getResponsables() {
        return service.getResponsables();
    }
}
