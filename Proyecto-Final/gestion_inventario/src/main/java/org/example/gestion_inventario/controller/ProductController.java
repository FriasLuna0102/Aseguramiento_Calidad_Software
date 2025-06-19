package org.example.gestion_inventario.controller;

import jakarta.persistence.EntityManager;
import org.example.gestion_inventario.model.entity.Product;
import org.example.gestion_inventario.services.ProductService;
import org.hibernate.envers.AuditReader;
import org.hibernate.envers.AuditReaderFactory;
import org.hibernate.envers.query.AuditEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService productService;
    private final EntityManager em;

    public ProductController(ProductService productService, EntityManager em) {
        this.productService = productService;
        this.em = em;
    }

    @GetMapping
    public List<Product> all() {
        return productService.listAll();
    }

    @PostMapping
    public ResponseEntity<Product> create(@RequestBody Product p) {
        Product saved = productService.create(p);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{id}/revisions")
    public List<?> revisions(@PathVariable Long id) {
        AuditReader reader = AuditReaderFactory.get(em);
        return reader.createQuery()
                .forRevisionsOfEntity(Product.class, false, true)
                .add(AuditEntity.id().eq(id))
                .getResultList();
    }
}
