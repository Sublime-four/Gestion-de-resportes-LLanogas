package llanogas.demo.modules.settings.repository;

import llanogas.demo.modules.settings.domain.AppSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppSettingsRepository extends JpaRepository<AppSettings, Long> {
}
