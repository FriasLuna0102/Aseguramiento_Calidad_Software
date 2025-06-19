package org.example.gestion_inventario.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.envers.Audited;

import java.math.BigDecimal;


@Entity
@Audited
@Table(name = "products")
@Setter
@Getter
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    private String category;

    private BigDecimal price;

    private int quantityInitial;

    private int quantityCurrent;

    public Product(String name, String description, String category, BigDecimal price, int quantityInitial, int quantityCurrent) {
        this.name = name;
        this.description = description;
        this.category = category;
        this.price = price;
        this.quantityInitial = quantityInitial;
        this.quantityCurrent = quantityCurrent;
    }

    public Product() {

    }
}

