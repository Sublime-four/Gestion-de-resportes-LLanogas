package llanogas.demo.modules.reports.repository;

import llanogas.demo.modules.reports.domain.Report;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {


    List<Report> findByResponsableElaboracionUserIdOrSupervisorCumplimientoUserId(
            Long responsableElaboracionUserId,
            Long supervisorCumplimientoUserId
    );
}
