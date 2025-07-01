package org.example.gestion_inventario.controller;

import org.example.gestion_inventario.config.jwt.utils.JwtUtil;
import org.example.gestion_inventario.model.dto.JwtResponse;
import org.example.gestion_inventario.model.dto.LoginRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthControllerTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testSuccessfulAuthentication() {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("testpass");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(jwtUtil.generateToken(authentication)).thenReturn("testToken");

        ResponseEntity<?> response = authController.authenticateUser(loginRequest);

        assertTrue(response.getStatusCode().is2xxSuccessful());
        assertNotNull(response.getBody());
        assertTrue(response.getBody() instanceof JwtResponse);
        JwtResponse jwtResponse = (JwtResponse) response.getBody();
        assertEquals("testToken", jwtResponse.getToken());
        assertEquals("testuser", jwtResponse.getUsername());
    }

    @Test
    void testFailedAuthentication() {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("wrongpass");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new AuthenticationException("Invalid credentials") {});

        ResponseEntity<?> response = authController.authenticateUser(loginRequest);

        assertTrue(response.getStatusCode().is4xxClientError());
        assertEquals("Error: Invalid username or password!", response.getBody());
    }

    @Test
    void testValidateValidToken() {
        String token = "Bearer validToken";
        when(jwtUtil.validateJwtToken("validToken")).thenReturn(true);
        when(jwtUtil.getUserNameFromJwtToken("validToken")).thenReturn("testuser");

        ResponseEntity<?> response = authController.validateToken(token);

        assertTrue(response.getStatusCode().is2xxSuccessful());
        assertEquals("Token is valid for user: testuser", response.getBody());
    }

    @Test
    void testValidateInvalidToken() {
        String token = "Bearer invalidToken";
        when(jwtUtil.validateJwtToken("invalidToken")).thenReturn(false);

        ResponseEntity<?> response = authController.validateToken(token);

        assertTrue(response.getStatusCode().is4xxClientError());
        assertEquals("Invalid token", response.getBody());
    }
}