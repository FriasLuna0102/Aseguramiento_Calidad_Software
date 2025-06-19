package org.example.gestion_inventario.repository;

import org.example.gestion_inventario.model.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
