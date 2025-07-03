package org.example.gestion_inventario.model.dto;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.Date;
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
        Date expirationDate = new Date();
        JwtResponse response = new JwtResponse("testToken", "testuser", expirationDate);

        assertEquals("testToken", response.getToken());
        assertEquals("Bearer", response.getType());
        assertEquals("testuser", response.getUsername());
        assertEquals(expirationDate, response.getExpirationDate());
        assertTrue(response.isValid());
    }

    @Test
    void testJwtResponseSettersAndGetters() {
        JwtResponse response = new JwtResponse();
        Date expirationDate = new Date();

        response.setToken("testToken");
        response.setUsername("testuser");
        response.setType("Bearer");
        response.setValid(true);
        response.setExpirationDate(expirationDate);

        assertEquals("testToken", response.getToken());
        assertEquals("Bearer", response.getType());
        assertEquals("testuser", response.getUsername());
        assertEquals(expirationDate, response.getExpirationDate());
        assertTrue(response.isValid());
    }
}