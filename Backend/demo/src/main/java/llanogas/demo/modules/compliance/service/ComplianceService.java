package llanogas.demo.modules.compliance.service;

import llanogas.demo.modules.compliance.dto.*;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class ComplianceService {

    // Mocks listos para el frontend
    public List<ComplianceEntityDTO> getEntities() {
        return Arrays.asList(
                new ComplianceEntityDTO("SUI", 10, 2, 1, 1, "Alto", 78, 1.4),
                new ComplianceEntityDTO("Superservicios", 8, 1, 0, 0, "Medio", 89, 0.0),
                new ComplianceEntityDTO("MinTIC", 12, 0, 3, 2, "Crítico", 60, 4.2)
        );
    }

    public RiskSummaryDTO getRiskSummary() {
        return new RiskSummaryDTO(
                3,  // critico
                5,  // alto
                12, // medio
                20, // bajo
                40  // total
        );
    }

    public List<String> getExecutiveNotes() {
        return Arrays.asList(
                "Aumento de obligaciones vencidas en MinTIC.",
                "Riesgo crítico asociado a retrasos recurrentes.",
                "Mejor desempeño en Superservicios respecto al trimestre anterior."
        );
    }

    public List<ComplianceHistoryDTO> getHistory() {
        return Arrays.asList(
                new ComplianceHistoryDTO("2024-01", 82),
                new ComplianceHistoryDTO("2024-02", 78),
                new ComplianceHistoryDTO("2024-03", 85),
                new ComplianceHistoryDTO("2024-04", 74)
        );
    }

    public List<ResponsableMetricDTO> getResponsables() {
        return Arrays.asList(
                new ResponsableMetricDTO("Juan Pérez", 92),
                new ResponsableMetricDTO("Ana López", 68),
                new ResponsableMetricDTO("Carlos Ruiz", 81)
        );
    }
}
