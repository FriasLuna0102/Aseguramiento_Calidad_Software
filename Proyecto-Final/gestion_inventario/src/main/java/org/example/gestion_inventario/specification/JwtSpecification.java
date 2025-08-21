package org.example.gestion_inventario.specification;

import org.example.gestion_inventario.model.entity.JwtResponse;
import org.springframework.data.jpa.domain.Specification;

import java.util.Date;

public class JwtSpecification {

    public static Specification<JwtResponse> hasUsername(String username) {
        return (root, query, cb) ->
                username == null ? null : cb.equal(root.get("username"), username);
    }

    public static Specification<JwtResponse> isValid(Boolean valid) {
        return (root, query, cb) ->
                valid == null ? null : cb.equal(root.get("valid"), valid);
    }

    public static Specification<JwtResponse> isExpired() {
        return (root, query, cb) ->
                cb.lessThan(root.get("expirationDate"), new Date());
    }

    public static Specification<JwtResponse> isNotExpired() {
        return (root, query, cb) ->
                cb.greaterThan(root.get("expirationDate"), new Date());
    }

    public static Specification<JwtResponse> expirationDateBefore(Date date) {
        return (root, query, cb) ->
                date == null ? null : cb.lessThan(root.get("expirationDate"), date);
    }

    public static Specification<JwtResponse> expirationDateAfter(Date date) {
        return (root, query, cb) ->
                date == null ? null : cb.greaterThan(root.get("expirationDate"), date);
    }

    public static Specification<JwtResponse> hasTokenContaining(String tokenPart) {
        return (root, query, cb) ->
                tokenPart == null ? null : cb.like(cb.lower(root.get("token")), "%" + tokenPart.toLowerCase() + "%");
    }

    public static Specification<JwtResponse> searchInUsernameOrToken(String searchTerm) {
        return (root, query, cb) -> {
            if (searchTerm == null || searchTerm.trim().isEmpty()) {
                return null;
            }
            String searchTermLower = "%" + searchTerm.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("username")), searchTermLower),
                    cb.like(cb.lower(root.get("token")), searchTermLower)
            );
        };
    }

    public static Specification<JwtResponse> hasType(String type) {
        return (root, query, cb) ->
                type == null ? null : cb.equal(root.get("type"), type);
    }

    public static Specification<JwtResponse> hasRoleContaining(String role) {
        return (root, query, cb) ->
                role == null ? null : cb.like(cb.lower(root.get("rolesString")), "%" + role.toLowerCase() + "%");
    }

    public static Specification<JwtResponse> createdBetween(Date startDate, Date endDate) {
        return (root, query, cb) -> {
            if (startDate == null && endDate == null) {
                return null;
            }
            if (startDate == null) {
                return cb.lessThanOrEqualTo(root.get("expirationDate"), endDate);
            }
            if (endDate == null) {
                return cb.greaterThanOrEqualTo(root.get("expirationDate"), startDate);
            }
            return cb.between(root.get("expirationDate"), startDate, endDate);
        };
    }
}