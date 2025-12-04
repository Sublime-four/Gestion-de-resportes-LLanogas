package llanogas.demo.modules.users.service;

import llanogas.demo.modules.users.domain.User;
import llanogas.demo.modules.users.dto.UserDto;
import llanogas.demo.modules.users.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ... lo que ya tengas

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public UserDto toDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setRoleId(user.getRole().getCode());      // ajusta según tu modelo
        dto.setRoleName(user.getRole().getName());    // idem
        return dto;
    }
}
