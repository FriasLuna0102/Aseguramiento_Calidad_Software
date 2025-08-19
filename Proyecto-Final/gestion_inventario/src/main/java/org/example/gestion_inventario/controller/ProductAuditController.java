package org.example.gestion_inventario.controller;

import org.example.gestion_inventario.model.dto.ProductAuditResponse;
import org.example.gestion_inventario.services.ProductAuditService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/product-audit")
public class ProductAuditController {

    private final ProductAuditService productAuditService;

    public ProductAuditController(ProductAuditService productAuditService) {
        this.productAuditService = productAuditService;
    }

    @GetMapping("/product/{id}/history")
    public ResponseEntity<Page<ProductAuditResponse>> getProductHistory(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "dateModified") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        Sort.Direction direction = Sort.Direction.fromString(sortDirection);
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortBy));

        return ResponseEntity.ok(productAuditService.getProductHistory(id, pageRequest));
    }

    @GetMapping("/all/history")
    public ResponseEntity<Page<ProductAuditResponse>> getAllProductsHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "dateModified") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        Sort.Direction direction = Sort.Direction.fromString(sortDirection);
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortBy));

        return ResponseEntity.ok(productAuditService.getAllProductsHistory(pageRequest));
    }
}