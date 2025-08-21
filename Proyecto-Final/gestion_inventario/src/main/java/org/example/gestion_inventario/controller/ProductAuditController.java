package org.example.gestion_inventario.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.example.gestion_inventario.model.dto.ProductAuditResponse;
import org.example.gestion_inventario.services.ProductAuditService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.Map;

@RestController
@RequestMapping("/product-audit")
@Tag(name = "Product Audit Controller", description = "Endpoints for managing product audit history")
public class ProductAuditController {

    private final ProductAuditService productAuditService;

    public ProductAuditController(ProductAuditService productAuditService) {
        this.productAuditService = productAuditService;
    }

    @Operation(summary = "Get product history by ID",
            description = "Returns the audit history for a specific product with optional filters")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Product history retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Product not found")
    })
    @GetMapping("/product/{id}/history")
    public ResponseEntity<Page<ProductAuditResponse>> getProductHistory(
            @Parameter(description = "Product ID")
            @PathVariable Long id,

            @Parameter(description = "Filter by modification type (ADD, MOD, DEL)")
            @RequestParam(required = false) String modificationType,

            @Parameter(description = "Filter by username who made the change")
            @RequestParam(required = false) String username,

            @Parameter(description = "Filter by minimum stock difference")
            @RequestParam(required = false) Integer minStockDifference,

            @Parameter(description = "Filter by maximum stock difference")
            @RequestParam(required = false) Integer maxStockDifference,

            @Parameter(description = "Filter from date (yyyy-MM-dd)")
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date fromDate,

            @Parameter(description = "Filter to date (yyyy-MM-dd)")
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date toDate,

            @Parameter(description = "Page number (0-based)")
            @RequestParam(defaultValue = "0") int page,

            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "10") int size,

            @Parameter(description = "Sort field")
            @RequestParam(defaultValue = "dateModified") String sortBy,

            @Parameter(description = "Sort direction (ASC/DESC)")
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        Sort.Direction direction = Sort.Direction.fromString(sortDirection);
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<ProductAuditResponse> result = productAuditService.getProductHistoryWithFilters(
                id, modificationType, username, minStockDifference, maxStockDifference,
                fromDate, toDate, pageRequest
        );

        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Get all products history",
            description = "Returns the audit history for all products with optional filters")
    @GetMapping("/all/history")
    public ResponseEntity<Page<ProductAuditResponse>> getAllProductsHistory(
            @Parameter(description = "Filter by product name")
            @RequestParam(required = false) String productName,

            @Parameter(description = "Filter by modification type (ADD, MOD, DEL)")
            @RequestParam(required = false) String modificationType,

            @Parameter(description = "Filter by username who made the change")
            @RequestParam(required = false) String username,

            @Parameter(description = "Filter by minimum stock difference")
            @RequestParam(required = false) Integer minStockDifference,

            @Parameter(description = "Filter by maximum stock difference")
            @RequestParam(required = false) Integer maxStockDifference,

            @Parameter(description = "Filter from date (yyyy-MM-dd)")
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date fromDate,

            @Parameter(description = "Filter to date (yyyy-MM-dd)")
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date toDate,

            @Parameter(description = "Search term for product name or username")
            @RequestParam(required = false) String searchTerm,

            @Parameter(description = "Page number (0-based)")
            @RequestParam(defaultValue = "0") int page,

            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "10") int size,

            @Parameter(description = "Sort field")
            @RequestParam(defaultValue = "dateModified") String sortBy,

            @Parameter(description = "Sort direction (ASC/DESC)")
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        Sort.Direction direction = Sort.Direction.fromString(sortDirection);
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<ProductAuditResponse> result = productAuditService.getAllProductsHistoryWithFilters(
                productName, modificationType, username, minStockDifference, maxStockDifference,
                fromDate, toDate, searchTerm, pageRequest
        );

        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Get audit statistics",
            description = "Returns statistics about product audit records")
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getAuditStatistics() {
        Map<String, Object> stats = productAuditService.getAuditStatistics();
        return ResponseEntity.ok(stats);
    }

    @Operation(summary = "Get recent changes",
            description = "Returns the most recent product changes")
    @GetMapping("/recent")
    public ResponseEntity<Page<ProductAuditResponse>> getRecentChanges(
            @Parameter(description = "Number of hours to look back")
            @RequestParam(defaultValue = "24") int hours,

            @Parameter(description = "Page number (0-based)")
            @RequestParam(defaultValue = "0") int page,

            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "10") int size) {

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "dateModified"));

        Page<ProductAuditResponse> result = productAuditService.getRecentChanges(hours, pageRequest);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Get changes by user",
            description = "Returns all changes made by a specific user")
    @GetMapping("/user/{username}")
    public ResponseEntity<Page<ProductAuditResponse>> getChangesByUser(
            @Parameter(description = "Username")
            @PathVariable String username,

            @Parameter(description = "Filter from date (yyyy-MM-dd)")
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date fromDate,

            @Parameter(description = "Filter to date (yyyy-MM-dd)")
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date toDate,

            @Parameter(description = "Page number (0-based)")
            @RequestParam(defaultValue = "0") int page,

            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "10") int size,

            @Parameter(description = "Sort field")
            @RequestParam(defaultValue = "dateModified") String sortBy,

            @Parameter(description = "Sort direction (ASC/DESC)")
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        Sort.Direction direction = Sort.Direction.fromString(sortDirection);
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<ProductAuditResponse> result = productAuditService.getChangesByUser(
                username, fromDate, toDate, pageRequest
        );

        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Get stock movements",
            description = "Returns audit records filtered by stock movement type")
    @GetMapping("/stock-movements")
    public ResponseEntity<Page<ProductAuditResponse>> getStockMovements(
            @Parameter(description = "Movement type: INCREASE, DECREASE, or ALL")
            @RequestParam(defaultValue = "ALL") String movementType,

            @Parameter(description = "Minimum absolute stock difference")
            @RequestParam(required = false) Integer minDifference,

            @Parameter(description = "Filter from date (yyyy-MM-dd)")
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date fromDate,

            @Parameter(description = "Filter to date (yyyy-MM-dd)")
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date toDate,

            @Parameter(description = "Page number (0-based)")
            @RequestParam(defaultValue = "0") int page,

            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "10") int size,

            @Parameter(description = "Sort field")
            @RequestParam(defaultValue = "dateModified") String sortBy,

            @Parameter(description = "Sort direction (ASC/DESC)")
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        Sort.Direction direction = Sort.Direction.fromString(sortDirection);
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<ProductAuditResponse> result = productAuditService.getStockMovements(
                movementType, minDifference, fromDate, toDate, pageRequest
        );

        return ResponseEntity.ok(result);
    }
}