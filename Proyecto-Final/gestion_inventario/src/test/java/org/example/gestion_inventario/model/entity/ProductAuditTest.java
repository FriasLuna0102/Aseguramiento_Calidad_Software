package org.example.gestion_inventario.model.entity;


import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.hibernate.validator.internal.util.Contracts.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class ProductAuditTest {

    @Test
    void testProductAuditCreation() {
        ProductAudit product = new ProductAudit();
        product.setName("Test Product");
        product.setDescription("Test Description");
        product.setCategory("Test Category");
        product.setPrice(BigDecimal.valueOf(100.00));
        product.setQuantityInitial(10);
        product.setQuantityCurrent(5);
        product.setStockMinimalQuantity(25);

        assertNotNull(product);
        assertEquals("Test Product", product.getName());
        assertEquals("Test Description", product.getDescription());
        assertEquals("Test Category", product.getCategory());
        assertEquals(BigDecimal.valueOf(100.00), product.getPrice());
        assertEquals(10, product.getQuantityInitial());
        assertEquals(5, product.getQuantityCurrent());
        assertEquals(25, product.getStockMinimalQuantity());
    }

    @Test
    void testEmptyConstructorAndSetters() {
        ProductAudit product = new ProductAudit();

        product.setName("Test Product");
        product.setDescription("Test Description");
        product.setCategory("Test Category");
        product.setPrice(BigDecimal.valueOf(100.00));
        product.setQuantityInitial(10);
        product.setQuantityCurrent(5);
        product.setStockMinimalQuantity(25);

        assertEquals("Test Product", product.getName());
        assertEquals("Test Description", product.getDescription());
        assertEquals("Test Category", product.getCategory());
        assertEquals(BigDecimal.valueOf(100.00), product.getPrice());
        assertEquals(10, product.getQuantityInitial());
        assertEquals(5, product.getQuantityCurrent());
        assertEquals(25, product.getStockMinimalQuantity());
    }



}
