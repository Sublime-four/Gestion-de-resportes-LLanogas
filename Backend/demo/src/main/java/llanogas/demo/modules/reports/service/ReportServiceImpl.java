package llanogas.demo.modules.reports.service;

import llanogas.demo.modules.reports.domain.Report;
import llanogas.demo.modules.reports.dto.ReportCreateDto;
import llanogas.demo.modules.reports.dto.ReportDto;
import llanogas.demo.modules.reports.dto.ReportImportDto;
import llanogas.demo.modules.reports.mapper.ReportMapper;
import llanogas.demo.modules.reports.repository.ReportRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class ReportServiceImpl implements ReportService {

    private final ReportRepository reportRepository;
    private final ReportMapper reportMapper;

    public ReportServiceImpl(ReportRepository reportRepository,
                             ReportMapper reportMapper) {
        this.reportRepository = reportRepository;
        this.reportMapper = reportMapper;
    }

    @Override
    public List<ReportDto> importReports(List<ReportImportDto> importDtos) {
        List<Report> entities = importDtos.stream()
                .map(reportMapper::fromImportDto)
                .toList();
        List<Report> saved = reportRepository.saveAll(entities);
        return reportMapper.toDtoList(saved);
    }

    @Override
    public ReportDto createReport(ReportCreateDto createDto) {
        Report entity = reportMapper.fromCreateDto(createDto);
        Report saved = reportRepository.save(entity);
        return reportMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReportDto> findAll() {
        return reportMapper.toDtoList(reportRepository.findAll());
    }

    @Override
    public void deleteReport(Long id) {
        if (!reportRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Reporte no encontrado con id: " + id
            );
        }
        reportRepository.deleteById(id);
    }
}
