package org.example.cart_shopping.entity;

import java.util.Objects;

public class ItemCart {
    private String productId;
    private int quantity;
    private double price;

    public ItemCart(String productId, int quantity, double price) {
        if (productId == null || productId.isEmpty()) {
            throw new IllegalArgumentException("El productId no puede ser nulo o vacío.");
        }
        if (quantity <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a cero.");
        }
        if (price <= 0) {
            throw new IllegalArgumentException("El precio unitario debe ser mayor a cero.");
        }
        this.productId = productId;
        this.quantity = quantity;
        this.price = price;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        if (productId == null || productId.isEmpty()) {
            throw new IllegalArgumentException("El productId no puede ser nulo o vacío.");
        }
        this.productId = productId;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a cero.");
        }
        this.quantity = quantity;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        if (price <= 0) {
            throw new IllegalArgumentException("El precio unitario debe ser mayor a cero.");
        }
        this.price = price;
    }

    public double getSubtotal() {
        return this.quantity * this.price;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ItemCart)) return false;
        ItemCart item = (ItemCart) o;
        return Objects.equals(productId, item.productId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(productId);
    }
}
