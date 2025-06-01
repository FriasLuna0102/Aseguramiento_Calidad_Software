package org.example.cart_shopping.entity;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class CartTest {

    private Cart cart;

    @BeforeEach
    public void setUp() {
        cart = new Cart("user1", "cart1");
        ItemCart item1 = new ItemCart("p1", 2, 50.0);
        ItemCart item2 = new ItemCart("p2", 1, 200.0);
        cart.addItem(item1);
        cart.addItem(item2);
    }

    @Test
    public void testAddItem_success() {
        assertEquals(2, cart.getItems().size());
        assertEquals(300.0, cart.getTotalPrice());
    }

    @Test
    public void testAddItem_nullItem() {
        assertThrows(IllegalArgumentException.class, () -> cart.addItem(null));
    }

    @Test
    public void testAddItem_duplicateProductId() {
        ItemCart duplicate = new ItemCart("p1", 3, 50.0);
        assertThrows(IllegalStateException.class, () -> cart.addItem(duplicate));
    }

    @Test
    public void testRemoveItem_success() {
        cart.removeItem("p1");
        assertEquals(1, cart.getItems().size());
        assertEquals(200.0, cart.getTotalPrice());
    }

    @Test
    public void testRemoveItem_notFound() {
        assertThrows(IllegalStateException.class, () -> cart.removeItem("p3"));
    }

    @Test
    public void testRemoveItem_invalidProductId() {
        assertThrows(IllegalArgumentException.class, () -> cart.removeItem(null));
        assertThrows(IllegalArgumentException.class, () -> cart.removeItem(""));
    }

    @Test
    public void testUpdateItemQuantity_success() {
        cart.updateItemQuantity("p1", 5);
        assertEquals(5, cart.getItems().stream()
                .filter(i -> i.getProductId().equals("p1"))
                .findFirst().get().getQuantity());
        assertEquals(450.0, cart.getTotalPrice());
    }

    @Test
    public void testUpdateItemQuantity_notFound() {
        assertThrows(IllegalStateException.class, () -> cart.updateItemQuantity("p3", 2));
    }

    @Test
    public void testUpdateItemQuantity_invalidQuantity() {
        assertThrows(IllegalArgumentException.class, () -> cart.updateItemQuantity("p1", 0));
        assertThrows(IllegalArgumentException.class, () -> cart.updateItemQuantity("", 2));
    }

    @Test
    public void testClearCart() {
        cart.clearCart();
        assertTrue(cart.getItems().isEmpty());
        assertEquals(0.0, cart.getTotalPrice());
    }

    @Test
    public void testConstructorInvalidArguments() {
        assertThrows(IllegalArgumentException.class, () -> new Cart(null, "c1"));
        assertThrows(IllegalArgumentException.class, () -> new Cart("", "c1"));
        assertThrows(IllegalArgumentException.class, () -> new Cart("u1", null));
        assertThrows(IllegalArgumentException.class, () -> new Cart("u1", ""));
    }

}
