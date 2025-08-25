package org.example.gestion_inventario.repository;

import org.example.gestion_inventario.model.entity.JwtResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface JwtRepository extends JpaRepository<JwtResponse, String>, JpaSpecificationExecutor<JwtResponse> {
}