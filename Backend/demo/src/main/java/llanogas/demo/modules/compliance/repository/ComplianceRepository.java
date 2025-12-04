package llanogas.demo.modules.compliance.repository;

import llanogas.demo.modules.compliance.model.ComplianceEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComplianceRepository extends JpaRepository<ComplianceEntity, Long> {

}
