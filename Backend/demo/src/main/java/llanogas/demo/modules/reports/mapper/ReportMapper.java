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
        // Si en el Excel tienes algún ID interno, lo setearías acá
        // entity.setIdReporte(dto.getIdReporte());

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
        updateEntityFromCreateDto(dto, entity);
        return entity;
    }

    public void updateEntityFromCreateDto(ReportCreateDto dto, Report entity) {

        // Campos obligatorios en creación, pero opcionales en update
        if (dto.getIdReporte() != null) {
            entity.setIdReporte(dto.getIdReporte());
        }
        if (dto.getNombreReporte() != null) {
            entity.setNombreReporte(dto.getNombreReporte());
        }

        // Campos opcionales: solo se actualizan si vienen no nulos
        if (dto.getEntidadControl() != null) {
            entity.setEntidadControl(dto.getEntidadControl());
        }
        if (dto.getBaseLegal() != null) {
            entity.setBaseLegal(dto.getBaseLegal());
        }
        if (dto.getInformacionContenido() != null) {
            entity.setInformacionContenido(dto.getInformacionContenido());
        }

        if (dto.getCargoResponsableEnvio() != null) {
            entity.setCargoResponsableEnvio(dto.getCargoResponsableEnvio());
        }
        if (dto.getResponsableElaboracionName() != null) {
            entity.setResponsableElaboracionName(dto.getResponsableElaboracionName());
        }
        if (dto.getResponsableElaboracionCC() != null) {
            entity.setResponsableElaboracionCC(dto.getResponsableElaboracionCC());
        }
        if (dto.getResponsableSupervisionName() != null) {
            entity.setResponsableSupervisionName(dto.getResponsableSupervisionName());
        }
        if (dto.getResponsableSupervisionCC() != null) {
            entity.setResponsableSupervisionCC(dto.getResponsableSupervisionCC());
        }
        if (dto.getTelefonoResponsable() != null) {
            entity.setTelefonoResponsable(dto.getTelefonoResponsable());
        }
        if (dto.getCorreosNotificacion() != null) {
            entity.setCorreosNotificacion(dto.getCorreosNotificacion());
        }
        if (dto.getEmailResponsableEnvio() != null) {
            entity.setEmailResponsableEnvio(dto.getEmailResponsableEnvio());
        }
        if (dto.getEmailLiderSeguimiento() != null) {
            entity.setEmailLiderSeguimiento(dto.getEmailLiderSeguimiento());
        }
        if (dto.getGerenciaResponsable() != null) {
            entity.setGerenciaResponsable(dto.getGerenciaResponsable());
        }

        if (dto.getFechaInicio() != null) {
            entity.setFechaInicio(dto.getFechaInicio());
        }
        if (dto.getFechaLimiteEnvio() != null) {
            entity.setFechaLimiteEnvio(dto.getFechaLimiteEnvio());
        }

        if (dto.getFrecuencia() != null) {
            entity.setFrecuencia(dto.getFrecuencia());
        }

        // 🔹 CLAVE: asignación a usuarios (esto es lo que usa MyTasks)
        if (dto.getResponsableElaboracionUserId() != null) {
            entity.setResponsableElaboracionUserId(dto.getResponsableElaboracionUserId());
        }
        if (dto.getSupervisorCumplimientoUserId() != null) {
            entity.setSupervisorCumplimientoUserId(dto.getSupervisorCumplimientoUserId());
        }
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

        // Asignación a usuarios
        dto.setResponsableElaboracionUserId(entity.getResponsableElaboracionUserId());
        dto.setSupervisorCumplimientoUserId(entity.getSupervisorCumplimientoUserId());

        return dto;
    }

    public List<ReportDto> toDtoList(List<Report> entities) {
        return entities.stream().map(this::toDto).collect(Collectors.toList());
    }
}
