package llanogas.demo.modules.users.web;

import llanogas.demo.modules.users.service.UserService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    // Inyección por constructor
    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Por ahora no exponemos endpoints concretos.
    // Más adelante aquí podemos agregar:
    // - GET /api/users          -> listar usuarios
    // - GET /api/users/{id}     -> detalle
    // - POST /api/users         -> crear
    // - PUT /api/users/{id}     -> actualizar
    // - DELETE /api/users/{id}  -> eliminar
}
