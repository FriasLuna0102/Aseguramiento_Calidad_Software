package org.example.gestion_inventario.services;

import org.example.gestion_inventario.model.dto.JwtResponse;
import org.example.gestion_inventario.repository.JwtRepository;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class JwtServices {
    private final JwtRepository jwtRepository;

    public JwtServices(JwtRepository jwtRepository) {
        this.jwtRepository = jwtRepository;
    }

    public void saveToken(JwtResponse jwtResponse) {
        jwtRepository.save(jwtResponse);
    }

    public void invalidateToken(String token) {
        Optional<JwtResponse> jwtResponse = jwtRepository.findById(token);
        jwtResponse.ifPresent(jwt -> {
            jwt.setValid(false);
            jwtRepository.save(jwt);
        });
    }

    public boolean isTokenValid(String token) {
        Optional<JwtResponse> jwtResponse = jwtRepository.findById(token);
        return jwtResponse.map(JwtResponse::isValid).orElse(false);
    }
}