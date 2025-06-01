package org.example.cart_shopping.entity;

public class Product {
    private String id;
    private String name;
    private double price;

    public Product(String id, String name, double price) {
        if (id == null || id.isEmpty()) {
            throw new IllegalArgumentException("El id del producto no puede ser nulo o vacío.");
        }
        if (name == null || name.isEmpty()) {
            throw new IllegalArgumentException("El nombre del producto no puede ser nulo o vacío.");
        }
        if (price < 0) {
            throw new IllegalArgumentException("El precio del producto no puede ser negativo.");
        }
        this.id = id;
        this.name = name;
        this.price = price;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        if (id == null || id.isEmpty()) {
            throw new IllegalArgumentException("El id del producto no puede ser nulo o vacío.");
        }
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        if (name == null || name.isEmpty()) {
            throw new IllegalArgumentException("El nombre del producto no puede ser nulo o vacío.");
        }
        this.name = name;
    }


    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        if (price < 0) {
            throw new IllegalArgumentException("El precio del producto no puede ser negativo.");
        }
        this.price = price;
    }
}
