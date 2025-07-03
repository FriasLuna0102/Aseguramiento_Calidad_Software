package org.example.gestion_inventario.model.dto;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;

class DtoTests {

    @Test
    void testLoginRequest() {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("testpass");

        assertEquals("testuser", loginRequest.getUsername());
        assertEquals("testpass", loginRequest.getPassword());
    }

    @Test
    void testJwtResponse() {
        JwtResponse response = new JwtResponse("testToken", "testuser");

        assertEquals("testToken", response.getToken());
        assertEquals("Bearer", response.getType());
        assertEquals("testuser", response.getUsername());
    }
}