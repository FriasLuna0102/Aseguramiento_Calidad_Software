package org.example.gestion_inventario.repository;

import org.example.gestion_inventario.model.entity.JwtResponse;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JwtRepository extends JpaRepository<JwtResponse, String> {
}
