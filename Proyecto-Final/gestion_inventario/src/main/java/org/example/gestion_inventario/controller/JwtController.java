package org.example.gestion_inventario.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.example.gestion_inventario.model.entity.JwtResponse;
import org.example.gestion_inventario.services.JwtServices;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/jwt")
@Tag(name = "JWT Controller", description = "Endpoints for managing JWT tokens")
public class JwtController {
    private final JwtServices jwtService;

    public JwtController(JwtServices jwtService) {
        this.jwtService = jwtService;
    }

    @GetMapping("/all")
    public List<JwtResponse> getAllTokens() {
        return jwtService.getAllTokens();

    }

    @GetMapping("/invalidate/{token}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public void invalidateToken(@PathVariable String token) {
        jwtService.invalidateToken(token);
    }


}
