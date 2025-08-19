package org.example.gestion_inventario.model.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
public class ProductAuditResponse {
    private Long id;
    private String productName;
    private Date dateModified;
    private String modificationType;
    private Integer previousStock;
    private Integer newStock;
    private Integer stockDifference;
    private String username;
}
