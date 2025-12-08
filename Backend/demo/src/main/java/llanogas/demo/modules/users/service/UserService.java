package llanogas.demo.modules.users.service;

import llanogas.demo.modules.users.domain.Role;
import llanogas.demo.modules.users.domain.User;
import llanogas.demo.modules.users.dto.UserDto;
import llanogas.demo.modules.users.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import llanogas.demo.modules.users.repository.RoleRepository;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Listar todos los usuarios (entidad completa).
     */
    public List<User> findAll() {
        return userRepository.findAll();
    }

    /**
     * Listar todos los usuarios como DTO (si lo necesitas en otros controllers).
     */
    public List<UserDto> findAllAsDto() {
        return userRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Crear un nuevo usuario desde datos de front.
     * El estado lo calcula el front; aquí no se persiste ningún status.
     */
    public User createUser(String fullName,
                           String email,
                           String roleCode,
                           String rawPassword) {

        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email);

        // Rol (admin, responsable_reportes, etc.)
        Role role = resolveRole(roleCode);
        user.setRole(role);

        // Password (opcional)
        if (rawPassword != null && !rawPassword.isBlank()) {
            String encoded = passwordEncoder.encode(rawPassword);
            user.setPassword(encoded);
        }

        return userRepository.save(user);
    }

    /**
     * Actualizar un usuario existente.
     * El estado se sigue manejando únicamente en el front.
     */
    public User updateUser(Long id,
                           String fullName,
                           String email,
                           String roleCode,
                           String rawPassword) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con id " + id));

        // Campos básicos
        user.setFullName(fullName);
        user.setEmail(email);

        // Rol
        if (roleCode != null && !roleCode.isBlank()) {
            Role role = resolveRole(roleCode);
            user.setRole(role);
        }

        // Solo cambiamos password si viene algo
        if (rawPassword != null && !rawPassword.isBlank()) {
            String encoded = passwordEncoder.encode(rawPassword);
            user.setPassword(encoded);
        }

        return userRepository.save(user);
    }

    /**
     * Eliminar usuario por id.
     */
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("Usuario no encontrado con id " + id);
        }
        userRepository.deleteById(id);
    }

    /**
     * Conversión entidad → DTO (por si lo sigues usando en otros módulos).
     * Aquí tampoco se maneja status.
     */
    public UserDto toDto(User user) {
        if (user == null) return null;

        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());

        if (user.getRole() != null) {
            dto.setRoleId(user.getRole().getCode());
            dto.setRoleName(user.getRole().getName());
        } else {
            dto.setRoleId(null);
            dto.setRoleName(null);
        }

        // Si tu UserDto tiene un campo status y lo calculas en front,
        // simplemente NO lo seteamos aquí.

        return dto;
    }

    /**
     * Resolver Role por código. Lanza excepción si no existe.
     */
    private Role resolveRole(String roleCode) {
        if (roleCode == null || roleCode.isBlank()) {
            throw new IllegalArgumentException("El código de rol es obligatorio");
        }

        return roleRepository.findByCode(roleCode)
                .orElseThrow(() -> new IllegalArgumentException("Rol no encontrado con código " + roleCode));
    }
}
