package org.example.cart_shopping.entity;

import java.util.ArrayList;
import java.util.List;

public class Cart {
    private String userId;
    private String cartId;
    private double totalPrice;
    private List<ItemCart> items;

    public Cart(String userId, String cartId, double totalPrice) {
        this.userId = userId;
        this.cartId = cartId;
        this.totalPrice = totalPrice;
        this.items = new ArrayList<>();
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getCartId() {
        return cartId;
    }

    public void setCartId(String cartId) {
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
        if (item == null || item.getProductId() == null || item.getQuantity() <= 0) {
            throw new IllegalArgumentException("Invalid item to add to cart");
        }else if (this.items == null) {
            throw new IllegalStateException("Cart items list is not initialized");
        }else if (this.items.contains(item)) {
            throw new IllegalStateException("Item already exists in the cart");
        }else {
            this.items.add(item);
        }
        this.totalPrice += item.getPrice() * item.getQuantity();
    }

    public void removeItem(String productId) {
        if (productId == null || this.items == null) {
            throw new IllegalArgumentException("Invalid product ID or cart items list is not initialized");
        }

        ItemCart itemToRemove = null;
        for (ItemCart item : this.items) {
            if (item.getProductId().equals(productId)) {
                itemToRemove = item;
                break;
            }
        }

        if (itemToRemove != null) {
            this.items.remove(itemToRemove);
            this.totalPrice -= itemToRemove.getPrice() * itemToRemove.getQuantity();
        } else {
            throw new IllegalStateException("Item not found in the cart");
        }
    }

    public void clearCart() {
        if (this.items == null) {
            throw new IllegalStateException("Cart items list is not initialized");
        }
        this.items.clear();
        this.totalPrice = 0.0;
    }

    public void updateItemQuantity(String productId, int newQuantity) {
        if (productId == null || newQuantity <= 0 || this.items == null) {
            throw new IllegalArgumentException("Invalid product ID, quantity or cart items list is not initialized");
        }

        for (ItemCart item : this.items) {
            if (item.getProductId().equals(productId)) {
                double pricePerUnit = item.getPrice() / item.getQuantity();
                this.totalPrice -= item.getPrice();
                item.setQuantity(newQuantity);
                item.setPrice(pricePerUnit * newQuantity);
                this.totalPrice += item.getPrice();
                return;
            }
        }

        throw new IllegalStateException("Item not found in the cart");
    }
}
