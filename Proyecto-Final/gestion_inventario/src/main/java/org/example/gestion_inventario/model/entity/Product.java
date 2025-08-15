package org.example.gestion_inventario.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
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
    @NotBlank(message = "Name cannot be blank")
    @Size(min = 3, max = 50, message = "Name must be between 3 and 50 characters")
    private String name;

    @Column(nullable = false)
    @NotBlank(message = "Description cannot be blank")
    @Size(min = 3, max = 1000, message = "Description must be between 3 and 1000 characters")
    private String description;

    @Column(nullable = false)
    @NotBlank(message = "Category cannot be blank")
    @Size(min = 3, max = 50, message = "Category must be between 3 and 50 characters")
    private String category;

    @Column(nullable = false)
    @NotNull(message = "Price cannot be null")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Price must have at most 10 digits and 2 decimals")
    private BigDecimal price;

    @Column(nullable = false)
    @NotNull(message = "Initial quantity cannot be null")
    @Min(value = 0, message = "Initial quantity must be greater than or equal to 0")
    @Max(value = 999999, message = "Initial quantity must be less than 1000000")
    private int quantityInitial;

    @Column(nullable = false)
    @NotNull(message = "Current quantity cannot be null")
    @Min(value = 0, message = "Current quantity must be greater than or equal to 0")
    @Max(value = 999999, message = "Current quantity must be less than 1000000")
    private int quantityCurrent;

    @Column(nullable = false)
    @NotNull(message = "Stock Minimal quantity cannot be null")
    @Min(value = 0, message = "Stock Minimal quantity must be greater than or equal to 0")
    @Max(value = 999999, message = "Stock Minimal quantity must be less than 1000000")
    private int stockMinimalQuantity;

    public Product(String name, String description, String category, BigDecimal price, int quantityInitial, int quantityCurrent, int stockMinimalQuantity) {
        this.name = name;
        this.description = description;
        this.category = category;
        this.price = price;
        this.quantityInitial = quantityInitial;
        this.quantityCurrent = quantityCurrent;
        this.stockMinimalQuantity = stockMinimalQuantity;
    }

    public Product() {

    }
}

