package org.example.cart_shopping.entity;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class ItemCartTest {

    @Test
    public void testConstructorAndGetters() {
        ItemCart item = new ItemCart("p1", 2, 50.0);
        assertEquals("p1", item.getProductId());
        assertEquals(2, item.getQuantity());
        assertEquals(50.0, item.getPrice());
        assertEquals(100.0, item.getSubtotal());
    }

    @Test
    public void testSetters() {
        ItemCart item = new ItemCart("p1", 2, 50.0);
        item.setQuantity(5);
        item.setPrice(60.0);
        assertEquals(5, item.getQuantity());
        assertEquals(60.0, item.getPrice());
        assertEquals(300.0, item.getSubtotal());
        item.setProductId("p2");
        assertEquals("p2", item.getProductId());
    }

    @Test
    public void testEqualsAndHashCode() {
        ItemCart item1 = new ItemCart("p1", 2, 50.0);
        ItemCart item2 = new ItemCart("p1", 3, 60.0);
        ItemCart item3 = new ItemCart("p2", 2, 50.0);
        assertEquals(item1, item2);
        assertNotEquals(item1, item3);
        assertEquals(item1.hashCode(), item2.hashCode());
    }

    @Test
    public void testInvalidConstructorArguments() {
        assertThrows(IllegalArgumentException.class, () -> new ItemCart(null, 1, 10.0));
        assertThrows(IllegalArgumentException.class, () -> new ItemCart("p1", 0, 10.0));
        assertThrows(IllegalArgumentException.class, () -> new ItemCart("p1", 1, 0.0));
    }

    @Test
    public void testInvalidSetterArguments() {
        ItemCart item = new ItemCart("p1", 2, 50.0);
        assertThrows(IllegalArgumentException.class, () -> item.setProductId(""));
        assertThrows(IllegalArgumentException.class, () -> item.setQuantity(0));
        assertThrows(IllegalArgumentException.class, () -> item.setPrice(-5.0));
    }
}
