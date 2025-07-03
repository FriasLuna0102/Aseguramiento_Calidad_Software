package org.example.gestion_inventario.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ProductUpdateDto {
    @NotBlank(message = "El nombre del producto no puede estar vacío")
    private String name;
    private BigDecimal price;
    private String description;
    private String category;
    private Integer quantityInitial;
    private Integer quantityCurrent;
}
