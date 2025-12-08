package llanogas.demo.modules.users.web;

import llanogas.demo.modules.users.domain.User;
import llanogas.demo.modules.users.service.UserService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    // Inyección por constructor
    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * GET /api/users
     * Devuelve el catálogo de usuarios para el front.
     */
    @GetMapping
    public List<UserResponse> listAll() {
        List<User> users = userService.findAll();
        return users.stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * POST /api/users
     * Crea un nuevo usuario.
     */
    @PostMapping
    public UserResponse create(@RequestBody UpdateUserRequest request) {
        User created = userService.createUser(
                request.getFullName(),
                request.getEmail(),
                request.getRoleId(),
                request.getPassword() // puede ser null o vacío
        );
        return UserResponse.fromEntity(created);
    }

    /**
     * PUT /api/users/{id}
     * Actualiza un usuario existente.
     */
    @PutMapping("/{id}")
    public UserResponse update(
            @PathVariable Long id,
            @RequestBody UpdateUserRequest request
    ) {
        User updated = userService.updateUser(
                id,
                request.getFullName(),
                request.getEmail(),
                request.getRoleId(),
                request.getPassword() // si es null/vacío, el service puede ignorar el cambio de contraseña
        );
        return UserResponse.fromEntity(updated);
    }

    /**
     * DELETE /api/users/{id}
     * Elimina un usuario.
     */
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        userService.deleteUser(id);
    }

    /**
     * DTO de entrada para crear/editar usuario.
     * Alineado con el payload que manda el frontend:
     * { fullName, email, roleId, status, password? }
     *
     * OJO: 'status' se recibe pero actualmente se ignora en backend,
     * porque el estado lo calcula el front.
     */
    public static class UpdateUserRequest {
        private String fullName;
        private String email;
        private String roleId;   // "admin", "responsable_reportes", etc.
        private String status;   // lo ignora el backend por ahora
        private String password; // opcional

        public String getFullName() {
            return fullName;
        }

        public void setFullName(String fullName) {
            this.fullName = fullName;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getRoleId() {
            return roleId;
        }

        public void setRoleId(String roleId) {
            this.roleId = roleId;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    /**
     * DTO de salida para evitar exponer directamente la entidad User.
     * Alineado con lo que necesita el frontend:
     * { id, fullName, email, roleId }
     * El 'status' lo deriva el front.
     */
    public static class UserResponse {
        private Long id;
        private String fullName;
        private String email;
        private String roleId;

        public UserResponse() {
        }

        public UserResponse(Long id, String fullName, String email, String roleId) {
            this.id = id;
            this.fullName = fullName;
            this.email = email;
            this.roleId = roleId;
        }

        public static UserResponse fromEntity(User user) {
            if (user == null) return null;

            String fullName = user.getFullName(); // método de la entidad
            String roleCode = null;
            if (user.getRole() != null) {
                roleCode = user.getRole().getCode(); // "admin", "responsable_reportes", etc.
            }

            return new UserResponse(
                    user.getId(),
                    fullName,
                    user.getEmail(),
                    roleCode
            );
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getFullName() {
            return fullName;
        }

        public void setFullName(String fullName) {
            this.fullName = fullName;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getRoleId() {
            return roleId;
        }

        public void setRoleId(String roleId) {
            this.roleId = roleId;
        }
    }
}
