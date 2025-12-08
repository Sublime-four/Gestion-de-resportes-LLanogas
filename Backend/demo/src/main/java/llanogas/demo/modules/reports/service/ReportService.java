package llanogas.demo.modules.reports.service;

import llanogas.demo.modules.reports.dto.ReportCreateDto;
import llanogas.demo.modules.reports.dto.ReportDto;
import llanogas.demo.modules.reports.dto.ReportImportDto;

import java.util.List;

public interface ReportService {

    List<ReportDto> importReports(List<ReportImportDto> importDtos);

    ReportDto createReport(ReportCreateDto createDto);

    List<ReportDto> findAll();

    void deleteReport(Long id);

    ReportDto updateReport(Long id, ReportCreateDto dto);

    List<ReportDto> findByAssignedUser(Long userId);
}
