package org.example.gestion_inventario.config;

import org.junit.jupiter.api.Test;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;

class SecurityConfigTest {

    private final SecurityConfig securityConfig = new SecurityConfig();
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public SecurityConfigTest() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testPasswordEncoder() {
        PasswordEncoder encoder = securityConfig.passwordEncoder();
        String password = "testPassword";
        String encodedPassword = encoder.encode(password);

        assertNotNull(encodedPassword);
        assertNotEquals(password, encodedPassword);
        assertTrue(encoder.matches(password, encodedPassword));
    }

    @Test
    void testUserDetailsService() {
        var userDetailsManager = securityConfig.userDetailsService(passwordEncoder);

        UserDetails adminUser = userDetailsManager.loadUserByUsername("admin");
        assertNotNull(adminUser);
        assertEquals("admin", adminUser.getUsername());
        assertTrue(adminUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));

        UserDetails employeeUser = userDetailsManager.loadUserByUsername("employee");
        assertNotNull(employeeUser);
        assertEquals("employee", employeeUser.getUsername());
        assertTrue(employeeUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_EMPLOYEE")));
    }

    @Test
    void testAuthenticationProvider() {
        var provider = securityConfig.authenticationProvider();
        assertNotNull(provider);
    }
}