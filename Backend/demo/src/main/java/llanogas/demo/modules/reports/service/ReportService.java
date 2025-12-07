package llanogas.demo.modules.reports.service;

import llanogas.demo.modules.reports.dto.ReportCreateDto;
import llanogas.demo.modules.reports.dto.ReportDto;
import llanogas.demo.modules.reports.dto.ReportImportDto;

import java.util.List;

public interface ReportService {

    List<ReportDto> importReports(List<ReportImportDto> importDtos);

    ReportDto createReport(ReportCreateDto createDto);

    List<ReportDto> findAll();

    // 👇 NUEVO: contrato para eliminar un reporte por id
    void deleteReport(Long id);
}
