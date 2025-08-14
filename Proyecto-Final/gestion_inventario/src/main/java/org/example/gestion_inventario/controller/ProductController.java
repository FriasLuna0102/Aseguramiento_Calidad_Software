package org.example.gestion_inventario.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityManager;
import jakarta.validation.Valid;
import org.example.gestion_inventario.model.dto.ProductDto;
import org.example.gestion_inventario.model.dto.ProductResponse;
import org.example.gestion_inventario.model.entity.Product;
import org.example.gestion_inventario.services.ProductService;
import org.hibernate.envers.AuditReader;
import org.hibernate.envers.AuditReaderFactory;
import org.hibernate.envers.query.AuditEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/products")
@Tag(name = "Product Controller", description = "Endpoints for managing products")
public class ProductController {

    private final ProductService productService;
    private final EntityManager em;

    public ProductController(ProductService productService, EntityManager em) {
        this.productService = productService;
        this.em = em;
    }

    @Operation(summary = "Get all products",
            description = "Returns a list of all products in the inventory")
    @GetMapping
    public ResponseEntity<Page<ProductResponse>> all(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.Direction.fromString(direction),
                sortBy
        );

        Page<ProductResponse> products = productService.findAllWithFilters(
                category, searchTerm, minPrice, maxPrice, pageable
        );
        return ResponseEntity.ok(products);
    }


    @Operation(summary = "Create a new product",
            description = "Creates a new product with the provided information")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Product created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_EMPLOYEE')")
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductDto dto) {
        ProductResponse saved = productService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }


    @Operation(summary = "Update a product",
            description = "Updates an existing product with the provided information")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Product updated successfully"),
            @ApiResponse(responseCode = "404", description = "Product not found"),
            @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_EMPLOYEE')")
    public ResponseEntity<ProductResponse> update(@PathVariable Long id, @Valid @RequestBody ProductDto dto) {
        ProductResponse updated = productService.update(id, dto);
        return ResponseEntity.ok(updated);
    }


    @Operation(summary = "Get a product by ID",
            description = "Returns a product based on the provided ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Product found"),
            @ApiResponse(responseCode = "404", description = "Product not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getById(@PathVariable Long id) {
        ProductResponse product = productService.findById(id);
        return ResponseEntity.ok(product);
    }


    @Operation(summary = "Delete a product",
            description = "Deletes a product based on the provided ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Product deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Product not found")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
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
