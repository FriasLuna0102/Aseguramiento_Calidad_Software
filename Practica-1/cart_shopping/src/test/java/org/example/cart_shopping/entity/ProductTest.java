package org.example.cart_shopping.entity;


import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class ProductTest  {

    @Test
    public void testConstructorAndGetters() {
        Product p = new Product("p1", "Laptop", 1000.0);
        assertEquals("p1", p.getId());
        assertEquals("Laptop", p.getName());
        assertEquals(1000.0, p.getPrice());
    }

    @Test
    public void testSetters() {
        Product p = new Product("p1", "Laptop", 1000.0);
        p.setName("Notebook");
        p.setPrice(1200.0);
        assertEquals("Notebook", p.getName());
        assertEquals(1200.0, p.getPrice());
        p.setId("p2");
        assertEquals("p2", p.getId());
    }

    @Test
    public void testInvalidConstructorArguments() {
        assertThrows(IllegalArgumentException.class, () -> new Product(null, "Name", 10.0));
        assertThrows(IllegalArgumentException.class, () -> new Product("", "Name", 10.0));
        assertThrows(IllegalArgumentException.class, () -> new Product("p1", null, 10.0));
        assertThrows(IllegalArgumentException.class, () -> new Product("p1", "", 10.0));
        assertThrows(IllegalArgumentException.class, () -> new Product("p1", "Name", -5.0));
    }

    @Test
    public void testInvalidSetterArguments() {
        Product p = new Product("p1", "Laptop", 1000.0);
        assertThrows(IllegalArgumentException.class, () -> p.setId(null));
        assertThrows(IllegalArgumentException.class, () -> p.setName(""));
        assertThrows(IllegalArgumentException.class, () -> p.setPrice(-100.0));
    }

}
