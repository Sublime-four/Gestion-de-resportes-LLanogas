package llanogas.demo.modules.auth.domain;

import llanogas.demo.modules.users.domain.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Adaptador entre tu entidad User y Spring Security (UserDetails).
 * Sirve para que el SecurityContext sepa quién eres y qué rol tienes.
 */
public class AuthUserDetails implements UserDetails {

    private final Long id;
    private final String email;
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;

    public AuthUserDetails(Long id,
                           String email,
                           String password,
                           Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.authorities = authorities;
    }

    /**
     * Factory method para construir AuthUserDetails desde tu entidad User.
     */
    public static AuthUserDetails fromUser(User user) {
        // code del rol: "admin", "responsable_reportes", etc.
        String roleCode = user.getRole() != null ? user.getRole().getCode() : "consulta_auditoria";

        // Spring espera algo tipo "ROLE_ADMIN"
        SimpleGrantedAuthority authority =
                new SimpleGrantedAuthority("ROLE_" + roleCode.toUpperCase());

        return new AuthUserDetails(
                user.getId(),
                user.getEmail(),
                user.getPassword(),
                List.of(authority)
        );
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    // ------------- Métodos de UserDetails -----------------

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    // Spring usa "username" como identificador → aquí usamos el email
    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // si en el futuro manejas expiración, cámbialo
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // idem bloqueo
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // idem expiración de credenciales
    }

    @Override
    public boolean isEnabled() {
        return true; // si manejas "activo/inactivo", cámbialo
    }
}
