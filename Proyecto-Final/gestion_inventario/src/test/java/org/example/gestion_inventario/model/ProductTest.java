package org.example.gestion_inventario.model;

import org.junit.jupiter.api.Test;

public class ProductTest {

    @Test
    public void test() {
        Product product = new Product("Test Product", 10.0, 5);
        
        // Test getters
        assert "Test Product".equals(product.getName());
        assert product.getPrice() == 10.0;
        assert product.getQuantity() == 5;

        // Test setters
        product.setName("Updated Product");
        product.setPrice(15.0);
        product.setQuantity(10);

        assert "Updated Product".equals(product.getName());
        assert product.getPrice() == 15.0;
        assert product.getQuantity() == 10;
    }
}
