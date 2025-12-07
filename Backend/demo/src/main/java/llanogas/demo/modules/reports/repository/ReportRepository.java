package llanogas.demo.modules.reports.repository;

import llanogas.demo.modules.reports.domain.Report;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportRepository extends JpaRepository<Report, Long> {
    // Aquí puedes agregar queries específicas si las necesitas
}
