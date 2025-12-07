package llanogas.demo.modules.reports.mapper;

import llanogas.demo.modules.reports.domain.Report;
import llanogas.demo.modules.reports.dto.ReportCreateDto;
import llanogas.demo.modules.reports.dto.ReportDto;
import llanogas.demo.modules.reports.dto.ReportImportDto;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ReportMapper {

    public Report fromImportDto(ReportImportDto dto) {
        Report entity = new Report();
        entity.setEntidadControl(dto.getEntidadControl());
        entity.setNombreReporte(dto.getNombreReporte());
        entity.setInformacionContenido(dto.getInformacionContenido());
        entity.setFrecuencia(dto.getFrecuencia());
        entity.setCargoResponsableEnvio(dto.getCargoResponsableEnvio());
        entity.setResponsableElaboracionName(dto.getResponsableElaboracionName());
        entity.setEmailResponsableEnvio(dto.getEmailResponsableEnvio());
        entity.setResponsableSupervisionName(dto.getResponsableSupervisionName());
        entity.setEmailLiderSeguimiento(dto.getEmailLiderSeguimiento());
        entity.setGerenciaResponsable(dto.getGerenciaResponsable());
        entity.setBaseLegal(dto.getBaseLegal());
        entity.setFechaLimiteEnvio(dto.getFechaLimiteEnvio());
        entity.setFechaInicio(dto.getFechaInicio());
        entity.setTelefonoResponsable(dto.getTelefonoResponsable());
        entity.setCorreosNotificacion(dto.getCorreosNotificacion());
        return entity;
    }

    public Report fromCreateDto(ReportCreateDto dto) {
        Report entity = new Report();
        entity.setIdReporte(dto.getIdReporte());
        entity.setNombreReporte(dto.getNombreReporte());
        entity.setEntidadControl(dto.getEntidadControl());
        entity.setBaseLegal(dto.getBaseLegal());
        entity.setFechaInicio(dto.getFechaInicio());
        entity.setFrecuencia(dto.getFrecuencia());
        entity.setResponsableElaboracionName(dto.getResponsableElaboracionName());
        entity.setResponsableElaboracionCC(dto.getResponsableElaboracionCC());
        entity.setResponsableSupervisionName(dto.getResponsableSupervisionName());
        entity.setResponsableSupervisionCC(dto.getResponsableSupervisionCC());
        entity.setTelefonoResponsable(dto.getTelefonoResponsable());
        entity.setCorreosNotificacion(dto.getCorreosNotificacion());
        return entity;
    }

    public ReportDto toDto(Report entity) {
        ReportDto dto = new ReportDto();
        dto.setId(entity.getId());
        dto.setIdReporte(entity.getIdReporte());
        dto.setNombreReporte(entity.getNombreReporte());
        dto.setEntidadControl(entity.getEntidadControl());
        dto.setInformacionContenido(entity.getInformacionContenido());
        dto.setFrecuencia(entity.getFrecuencia());
        dto.setCargoResponsableEnvio(entity.getCargoResponsableEnvio());
        dto.setResponsableElaboracionName(entity.getResponsableElaboracionName());
        dto.setResponsableElaboracionCC(entity.getResponsableElaboracionCC());
        dto.setResponsableSupervisionName(entity.getResponsableSupervisionName());
        dto.setResponsableSupervisionCC(entity.getResponsableSupervisionCC());
        dto.setTelefonoResponsable(entity.getTelefonoResponsable());
        dto.setCorreosNotificacion(entity.getCorreosNotificacion());
        dto.setEmailResponsableEnvio(entity.getEmailResponsableEnvio());
        dto.setEmailLiderSeguimiento(entity.getEmailLiderSeguimiento());
        dto.setGerenciaResponsable(entity.getGerenciaResponsable());
        dto.setBaseLegal(entity.getBaseLegal());
        dto.setFechaInicio(entity.getFechaInicio());
        dto.setFechaLimiteEnvio(entity.getFechaLimiteEnvio());
        return dto;
    }

    public List<ReportDto> toDtoList(List<Report> entities) {
        return entities.stream().map(this::toDto).collect(Collectors.toList());
    }
}
