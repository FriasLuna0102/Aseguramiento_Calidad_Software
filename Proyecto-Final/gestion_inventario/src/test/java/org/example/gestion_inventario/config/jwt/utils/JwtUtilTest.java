package org.example.gestion_inventario.config.jwt.utils;

import org.example.gestion_inventario.config.jwt.utils.JwtUtil;
import org.example.gestion_inventario.services.JwtServices;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Arrays;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private Authentication authentication;
    private JwtServices jwtServices;

    @BeforeEach
    void setUp() {
        jwtServices = mock(JwtServices.class);
        jwtUtil = new JwtUtil(jwtServices);
        ReflectionTestUtils.setField(jwtUtil, "jwtSecret", "yourTestSecretKeyHereThatIsAtLeast256BitsLong");
        ReflectionTestUtils.setField(jwtUtil, "jwtExpirationMs", 86400000);
        ReflectionTestUtils.setField(jwtUtil, "jwtIssuer", "test-issuer");

        List<GrantedAuthority> authorities = Arrays.asList(
                new SimpleGrantedAuthority("ROLE_USER")
        );
        UserDetails userDetails = new User("testuser", "", authorities);

        authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);

        // Set up the behavior for mock
        when(jwtServices.isTokenValid(anyString())).thenReturn(true);
        doNothing().when(jwtServices).saveToken(any());
    }

    @Test
    void testGenerateAndValidateToken() {
        String token = jwtUtil.generateToken(authentication);

        assertNotNull(token);
        assertTrue(jwtUtil.validateJwtToken(token));
        assertEquals("testuser", jwtUtil.getUserNameFromJwtToken(token));
    }

    @Test
    void testGetRolesFromToken() {
        String token = jwtUtil.generateToken(authentication);

        List<String> roles = jwtUtil.getRolesFromJwtToken(token);

        assertNotNull(roles);
        assertTrue(roles.contains("ROLE_USER")); // Match casing
    }

    @Test
    void testInvalidToken() {
        assertFalse(jwtUtil.validateJwtToken("invalid.token.here"));
    }

    @Test
    void testGetExpirationDate() {
        String token = jwtUtil.generateToken(authentication);
        assertNotNull(jwtUtil.getExpirationDateFromJwtToken(token));
    }
}