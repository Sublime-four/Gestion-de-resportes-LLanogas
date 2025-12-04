package llanogas.demo.modules.auth.service;

import llanogas.demo.modules.auth.dto.LoginRequest;
import llanogas.demo.modules.auth.dto.LoginResponse;
import llanogas.demo.modules.users.domain.User;
import llanogas.demo.modules.users.dto.UserDto;
import llanogas.demo.modules.users.service.UserService;
import llanogas.demo.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserService userService,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public LoginResponse login(LoginRequest request) {
        User user = userService.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario o contraseña incorrectos"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Usuario o contraseña incorrectos");
        }

        // Genera el JWT solo con el email (subject)
        String token = jwtTokenProvider.generateToken(user.getEmail());

        UserDto dto = userService.toDto(user);

        return new LoginResponse(token, dto);
    }
}
