package org.example.gestion_inventario.model.entity;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import java.math.BigDecimal;

public class ProductTest {

    @Test
    void testProductCreation() {
        Product product = new Product(
                "Test Product",
                "Test Description",
                "Test Category",
                BigDecimal.valueOf(100.00),
                10,
                5,
                25
        );

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
        Product product = new Product();

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