package org.example.gestion_inventario.model.dto;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;

class ProductDtoTest {
    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void testValidProductUpdateDto() {
        ProductDto dto = new ProductDto();
        dto.setName("Test Product");
        dto.setPrice(BigDecimal.valueOf(100));
        dto.setDescription("Test Description");
        dto.setCategory("Test Category");
        dto.setQuantityInitial(10);
        dto.setQuantityCurrent(5);
        dto.setStockMinimalQuantity(2);

        var violations = validator.validate(dto);
        assertTrue(violations.isEmpty());

        assertEquals("Test Product", dto.getName());
        assertEquals(BigDecimal.valueOf(100), dto.getPrice());
        assertEquals("Test Description", dto.getDescription());
        assertEquals("Test Category", dto.getCategory());
        assertEquals(10, dto.getQuantityInitial());
        assertEquals(5, dto.getQuantityCurrent());
        assertEquals(2, dto.getStockMinimalQuantity());
    }

    @Test
    void testInvalidProductUpdateDto_BlankName() {
        ProductDto dto = new ProductDto();
        dto.setName("");
        dto.setPrice(BigDecimal.valueOf(100));
        dto.setDescription("Test Description");
        dto.setCategory("Test Category");
        dto.setQuantityInitial(10);
        dto.setQuantityCurrent(5);
        dto.setStockMinimalQuantity(2);

        var violations = validator.validate(dto);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getPropertyPath().toString().equals("name")));
    }

    @Test
    void testInvalidProductUpdateDto_NullName() {
        ProductDto dto = new ProductDto();
        dto.setName(null);
        dto.setPrice(BigDecimal.valueOf(100));
        dto.setDescription("Test Description");
        dto.setCategory("Test Category");
        dto.setQuantityInitial(10);
        dto.setQuantityCurrent(5);
        dto.setStockMinimalQuantity(2);

        var violations = validator.validate(dto);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getPropertyPath().toString().equals("name")));
    }

    @Test
    void testProductUpdateDto_RequiredFields() {
        ProductDto dto = new ProductDto();
        dto.setName("Test Product");

        var violations = validator.validate(dto);
        assertFalse(violations.isEmpty(), "Debería tener violaciones para campos requeridos faltantes");

        assertTrue(violations.stream()
                        .anyMatch(v -> v.getPropertyPath().toString().equals("description")),
                "Description should be required");
        assertTrue(violations.stream()
                        .anyMatch(v -> v.getPropertyPath().toString().equals("category")),
                "Category should be required");
        assertTrue(violations.stream()
                        .anyMatch(v -> v.getPropertyPath().toString().equals("price")),
                "Price should be required");
        assertTrue(violations.stream()
                        .anyMatch(v -> v.getPropertyPath().toString().equals("quantityCurrent")),
                "QuantityCurrent should be required");
        assertTrue(violations.stream()
                        .anyMatch(v -> v.getPropertyPath().toString().equals("stockMinimalQuantity")),
                "StockMinimalQuantity should be required");
    }

    @Test
    void testProductUpdateDto_SetAndGetAll() {
        ProductDto dto = new ProductDto();

        dto.setName("New Product");
        dto.setPrice(BigDecimal.valueOf(200));
        dto.setDescription("New Description");
        dto.setCategory("New Category");
        dto.setQuantityInitial(20);
        dto.setQuantityCurrent(15);
        dto.setStockMinimalQuantity(5);

        assertEquals("New Product", dto.getName());
        assertEquals(BigDecimal.valueOf(200), dto.getPrice());
        assertEquals("New Description", dto.getDescription());
        assertEquals("New Category", dto.getCategory());
        assertEquals(20, dto.getQuantityInitial());
        assertEquals(15, dto.getQuantityCurrent());
        assertEquals(5, dto.getStockMinimalQuantity());
    }
}