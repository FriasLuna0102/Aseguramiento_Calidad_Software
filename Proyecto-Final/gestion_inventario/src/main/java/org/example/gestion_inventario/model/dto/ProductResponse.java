package org.example.gestion_inventario.model.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.Builder;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private String category;
    private BigDecimal price;
    private int quantityInitial;
    private int quantityCurrent;
    private int stockMinimalQuantity;
}