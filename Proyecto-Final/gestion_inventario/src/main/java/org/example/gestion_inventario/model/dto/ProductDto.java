package org.example.gestion_inventario.model.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ProductDto {
    @NotBlank(message = "Name cannot be blank")
    @Size(min = 3, max = 50, message = "Name must be between 3 and 50 characters")
    private String name;

    @NotBlank(message = "Description cannot be blank")
    @Size(min = 3, max = 1000, message = "Description must be between 3 and 1000 characters")
    private String description;

    @NotBlank(message = "Category cannot be blank")
    @Size(min = 3, max = 50, message = "Category must be between 3 and 50 characters")
    private String category;

    @NotNull(message = "Price cannot be null")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Price must have at most 10 digits and 2 decimals")
    private BigDecimal price;

    @Min(value = 0, message = "Initial quantity must be greater than or equal to 0")
    @Max(value = 999999, message = "Initial quantity must be less than 1000000")
    private Integer quantityInitial;

    @NotNull(message = "Current quantity cannot be null")
    @Min(value = 0, message = "Current quantity must be greater than or equal to 0")
    @Max(value = 999999, message = "Current quantity must be less than 1000000")
    private Integer quantityCurrent;

    @NotNull(message = "Stock Minimal quantity cannot be null")
    @Min(value = 0, message = "Stock Minimal quantity must be greater than or equal to 0")
    @Max(value = 999999, message = "Stock Minimal quantity must be less than 1000000")
    private Integer stockMinimalQuantity;
}