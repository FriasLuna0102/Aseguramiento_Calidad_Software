package org.example.cart_shopping.entity;

import java.util.ArrayList;
import java.util.List;

public class Cart {
    private String userId;
    private String cartId;
    private double totalPrice;
    private List<ItemCart> items;

    public Cart(String userId, String cartId) {
        if (userId == null || userId.isEmpty()) {
            throw new IllegalArgumentException("El userId no puede ser nulo o vacío.");
        }
        if (cartId == null || cartId.isEmpty()) {
            throw new IllegalArgumentException("El cartId no puede ser nulo o vacío.");
        }
        this.userId = userId;
        this.cartId = cartId;
        this.totalPrice = 0.0;
        this.items = new ArrayList<>();
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        if (userId == null || userId.isEmpty()) {
            throw new IllegalArgumentException("El userId no puede ser nulo o vacío.");
        }
        this.userId = userId;
    }


    public String getCartId() {
        return cartId;
    }

    public void setCartId(String cartId) {
        if (cartId == null || cartId.isEmpty()) {
            throw new IllegalArgumentException("El cartId no puede ser nulo o vacío.");
        }
        this.cartId = cartId;
    }


    public double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public List<ItemCart> getItems() {
        return items;
    }

    public void setItems(List<ItemCart> items) {
        this.items = items;
    }

    public void addItem(ItemCart item) {
        if (item == null) {
            throw new IllegalArgumentException("El item no puede ser nulo.");
        }
        if (items.contains(item)) {
            throw new IllegalStateException("El item ya existe en el carrito.");
        }
        items.add(item);
        totalPrice += item.getSubtotal();
    }


    public void removeItem(String productId) {
        if (productId == null || productId.isEmpty()) {
            throw new IllegalArgumentException("El productId no puede ser nulo o vacío.");
        }
        ItemCart found = null;
        for (ItemCart item : items) {
            if (item.getProductId().equals(productId)) {
                found = item;
                break;
            }
        }
        if (found == null) {
            throw new IllegalStateException("No existe ningún ítem con productId: " + productId);
        }
        items.remove(found);
        totalPrice -= found.getSubtotal();
    }

    public void clearCart() {
        items.clear();
        totalPrice = 0.0;
    }

    public void updateItemQuantity(String productId, int newQuantity) {
        if (productId == null || productId.isEmpty()) {
            throw new IllegalArgumentException("El productId no puede ser nulo o vacío.");
        }
        if (newQuantity <= 0) {
            throw new IllegalArgumentException("La nueva cantidad debe ser mayor a cero.");
        }
        ItemCart found = null;
        for (ItemCart item : items) {
            if (item.getProductId().equals(productId)) {
                found = item;
                break;
            }
        }
        if (found == null) {
            throw new IllegalStateException("No existe ningún ítem con productId: " + productId);
        }
        totalPrice -= found.getSubtotal();
        found.setQuantity(newQuantity);
        totalPrice += found.getSubtotal();
    }


}
