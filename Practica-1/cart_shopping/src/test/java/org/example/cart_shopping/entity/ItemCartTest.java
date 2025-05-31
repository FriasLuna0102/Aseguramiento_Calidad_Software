package org.example.cart_shopping.entity;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class ItemCartTest {

    Cart cart;

    @BeforeEach
    void setUp() {
        cart = new Cart("123", "456", 0.0);
        ItemCart item1 = new ItemCart("Apple", 2, 0.5);
        ItemCart item2 = new ItemCart("Banana", 1, 0.5);
        ItemCart item3 = new ItemCart("Orange", 3, 0.5);
        cart.addItem(item1);
        cart.addItem(item2);
        cart.addItem(item3);
    }

    // Añadir
    @Test
    public void testAddItem() {
        assertEquals(3, cart.getItems().size());
    }

    //Eliminar
    @Test
    public void testRemoveItem() {
        String productId = cart.getItems().getFirst().getProductId();
        System.out.println("Product ID: " + productId);
        cart.removeItem(productId);
        assertEquals(2, cart.getItems().size());
    }

    // Modificar
    @Test
    public  void testUpdateItemQuantity() {
        String productId = cart.getItems().getFirst().getProductId();
        cart.updateItemQuantity(productId, 5);
        assertEquals(5, cart.getItems().getFirst().getQuantity());
    }

    @Test
    public void totalPrice() {
        // 2 * 0.5 + 1 * 0.5 + 3 * 0.5
        double expectedTotalPrice = 3.0;
        assertEquals(expectedTotalPrice, cart.getTotalPrice());
    }
}
