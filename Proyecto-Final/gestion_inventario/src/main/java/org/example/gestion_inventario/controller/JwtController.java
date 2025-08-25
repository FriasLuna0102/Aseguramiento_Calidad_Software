package org.example.gestion_inventario.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.example.gestion_inventario.model.entity.JwtResponse;
import org.example.gestion_inventario.services.JwtServices;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/jwt")
@Tag(name = "JWT Controller", description = "Endpoints for managing JWT tokens")
public class JwtController {
    private final JwtServices jwtService;

    public JwtController(JwtServices jwtService) {
        this.jwtService = jwtService;
    }

    @Operation(summary = "Get all JWT tokens with pagination and filters",
            description = "Returns a paginated list of JWT tokens with optional filters")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tokens retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Page<JwtResponse>> getAllTokens(
            @Parameter(description = "Filter by username")
            @RequestParam(required = false) String username,

            @Parameter(description = "Filter by token validity status")
            @RequestParam(required = false) Boolean valid,

            @Parameter(description = "Filter by expiration status (true for expired tokens)")
            @RequestParam(required = false) Boolean expired,

            @Parameter(description = "Search term for username or token")
            @RequestParam(required = false) String searchTerm,

            @Parameter(description = "Page number (0-based)")
            @RequestParam(defaultValue = "0") int page,

            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "10") int size,

            @Parameter(description = "Sort field")
            @RequestParam(defaultValue = "expirationDate") String sortBy,

            @Parameter(description = "Sort direction (asc/desc)")
            @RequestParam(defaultValue = "desc") String direction
    ) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.Direction.fromString(direction),
                sortBy
        );

        Page<JwtResponse> tokens = jwtService.findAllWithFilters(
                username, valid, expired, searchTerm, pageable
        );
        return ResponseEntity.ok(tokens);
    }

    @Operation(summary = "Get all JWT tokens (simple list)",
            description = "Returns a simple list of all JWT tokens without pagination")
    @GetMapping("/all/simple")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<JwtResponse>> getAllTokensSimple() {
        List<JwtResponse> tokens = jwtService.getAllTokens();
        return ResponseEntity.ok(tokens);
    }

    @Operation(summary = "Get token by ID",
            description = "Returns a specific JWT token by its token value")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Token found"),
            @ApiResponse(responseCode = "404", description = "Token not found"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @GetMapping("/{token}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<JwtResponse> getTokenById(@PathVariable String token) {
        JwtResponse jwtResponse = jwtService.findByToken(token);
        return ResponseEntity.ok(jwtResponse);
    }

    @Operation(summary = "Invalidate a JWT token",
            description = "Marks a JWT token as invalid, effectively logging out the user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Token invalidated successfully"),
            @ApiResponse(responseCode = "404", description = "Token not found"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PostMapping("/invalidate/{token}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<String> invalidateToken(@PathVariable String token) {
        jwtService.invalidateToken(token);
        return ResponseEntity.ok("Token invalidated successfully");
    }

    @Operation(summary = "Get expired tokens",
            description = "Returns all expired JWT tokens with pagination")
    @GetMapping("/expired")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Page<JwtResponse>> getExpiredTokens(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "expirationDate") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.Direction.fromString(direction),
                sortBy
        );

        Page<JwtResponse> expiredTokens = jwtService.findExpiredTokens(pageable);
        return ResponseEntity.ok(expiredTokens);
    }

    @Operation(summary = "Get active tokens",
            description = "Returns all active (valid and not expired) JWT tokens with pagination")
    @GetMapping("/active")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Page<JwtResponse>> getActiveTokens(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "expirationDate") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.Direction.fromString(direction),
                sortBy
        );

        Page<JwtResponse> activeTokens = jwtService.findActiveTokens(pageable);
        return ResponseEntity.ok(activeTokens);
    }

    @Operation(summary = "Get tokens by username",
            description = "Returns all JWT tokens for a specific user with pagination")
    @GetMapping("/user/{username}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Page<JwtResponse>> getTokensByUsername(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "expirationDate") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.Direction.fromString(direction),
                sortBy
        );

        Page<JwtResponse> userTokens = jwtService.findByUsername(username, pageable);
        return ResponseEntity.ok(userTokens);
    }

    @Operation(summary = "Invalidate all tokens for a user",
            description = "Invalidates all JWT tokens for a specific user")
    @PostMapping("/invalidate/user/{username}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<String> invalidateUserTokens(@PathVariable String username) {
        int invalidatedCount = jwtService.invalidateAllTokensForUser(username);
        return ResponseEntity.ok(String.format("Invalidated %d tokens for user: %s", invalidatedCount, username));
    }

    @Operation(summary = "Clean up expired tokens",
            description = "Removes all expired JWT tokens from the database")
    @DeleteMapping("/cleanup/expired")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<String> cleanupExpiredTokens() {
        int deletedCount = jwtService.cleanupExpiredTokens();
        return ResponseEntity.ok(String.format("Cleaned up %d expired tokens", deletedCount));
    }

    @Operation(summary = "Get token statistics",
            description = "Returns statistics about JWT tokens")
    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Long>> getTokenStatistics() {
        Map<String, Long> stats = jwtService.getTokenStatistics();
        return ResponseEntity.ok(stats);
    }
}