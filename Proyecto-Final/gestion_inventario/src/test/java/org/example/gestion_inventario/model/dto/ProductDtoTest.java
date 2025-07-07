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

        var violations = validator.validate(dto);
        assertTrue(violations.isEmpty());

        assertEquals("Test Product", dto.getName());
        assertEquals(BigDecimal.valueOf(100), dto.getPrice());
        assertEquals("Test Description", dto.getDescription());
        assertEquals("Test Category", dto.getCategory());
        assertEquals(10, dto.getQuantityInitial());
        assertEquals(5, dto.getQuantityCurrent());
    }

    @Test
    void testInvalidProductUpdateDto_BlankName() {
        ProductDto dto = new ProductDto();
        dto.setName("");
        dto.setPrice(BigDecimal.valueOf(100));

        var violations = validator.validate(dto);
        assertFalse(violations.isEmpty());
        assertEquals(1, violations.size());
        assertEquals("El nombre del producto no puede estar vacío",
                violations.iterator().next().getMessage());
    }

    @Test
    void testInvalidProductUpdateDto_NullName() {
        ProductDto dto = new ProductDto();
        dto.setName(null);

        var violations = validator.validate(dto);
        assertFalse(violations.isEmpty());
        assertEquals(1, violations.size());
    }

    @Test
    void testProductUpdateDto_NullableFields() {
        ProductDto dto = new ProductDto();
        dto.setName("Test Product");

        var violations = validator.validate(dto);
        assertTrue(violations.isEmpty());

        assertNull(dto.getPrice());
        assertNull(dto.getDescription());
        assertNull(dto.getCategory());
        assertNull(dto.getQuantityInitial());
        assertNull(dto.getQuantityCurrent());
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

        assertEquals("New Product", dto.getName());
        assertEquals(BigDecimal.valueOf(200), dto.getPrice());
        assertEquals("New Description", dto.getDescription());
        assertEquals("New Category", dto.getCategory());
        assertEquals(20, dto.getQuantityInitial());
        assertEquals(15, dto.getQuantityCurrent());
    }
}