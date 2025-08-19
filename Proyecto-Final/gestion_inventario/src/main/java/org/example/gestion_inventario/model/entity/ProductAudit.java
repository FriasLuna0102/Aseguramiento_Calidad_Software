package org.example.gestion_inventario.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Date;

@Setter
@Getter
@Entity
@Table(name = "product_audit")
public class ProductAudit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @NotNull(message = "Revision cannot be null")
    private Long revType;

    @Column(nullable = false)
    @NotNull(message = "Name cannot be null")
    private String name;

    @Column(nullable = false)
    @NotNull(message = "Description cannot be null")
    private String description;

    @Column(nullable = false)
    @NotNull(message = "Category cannot be null")
    private String category;

    @Column(nullable = false)
    @NotNull(message = "Price cannot be null")
    @Min(value = 0, message = "Price must be greater than or equal to 0")
    private BigDecimal price;


    @Column(nullable = false)
    @NotNull(message = "Initial quantity cannot be null")
    @Min(value = 0, message = "Initial quantity must be greater than or equal to 0")
    private int quantityInitial;


    @Column(nullable = false)
    @NotNull(message = "Current quantity cannot be null")
    @Min(value = 0, message = "Current quantity must be greater than or equal to 0")
    private int quantityCurrent;

    @Column(nullable = false)
    @NotNull(message = "Stock Minimal quantity cannot be null")
    @Min(value = 0, message = "Stock Minimal quantity must be greater than or equal to 0")
    private int stockMinimalQuantity;

    @Column(nullable = false)
    @NotNull(message = "Date created cannot be null")
    private Date dateCreated;

    @Column(nullable = false)
    @NotNull(message = "Date updated cannot be null")
    private Date dateUpdated;




}
