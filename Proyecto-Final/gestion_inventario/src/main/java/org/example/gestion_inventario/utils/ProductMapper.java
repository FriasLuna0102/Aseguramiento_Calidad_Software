package org.example.gestion_inventario.utils;

import org.example.gestion_inventario.model.dto.ProductResponse;
import org.example.gestion_inventario.model.entity.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public ProductResponse toResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .category(product.getCategory())
                .price(product.getPrice())
                .quantityInitial(product.getQuantityInitial())
                .quantityCurrent(product.getQuantityCurrent())
                .stockMinimalQuantity(product.getStockMinimalQuantity())
                .build();
    }
}