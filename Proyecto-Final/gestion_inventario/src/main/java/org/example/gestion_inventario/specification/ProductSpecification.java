package org.example.gestion_inventario.specification;

import org.example.gestion_inventario.model.entity.Product;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

public class ProductSpecification {

    public static Specification<Product> hasCategory(String category) {
        return (root, query, cb) ->
                category == null ? null : cb.equal(root.get("category"), category);
    }

    public static Specification<Product> nameLike(String name) {
        return (root, query, cb) ->
                name == null ? null : cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%");
    }

    public static Specification<Product> priceGreaterThan(BigDecimal price) {
        return (root, query, cb) ->
                price == null ? null : cb.greaterThan(root.get("price"), price);
    }

    public static Specification<Product> priceLessThan(BigDecimal price) {
        return (root, query, cb) ->
                price == null ? null : cb.lessThan(root.get("price"), price);
    }
}