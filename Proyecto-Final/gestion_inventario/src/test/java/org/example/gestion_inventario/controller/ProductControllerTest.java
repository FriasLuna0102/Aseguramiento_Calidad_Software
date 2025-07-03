package org.example.gestion_inventario.controller;

import org.example.gestion_inventario.model.dto.ProductUpdateDto;
import org.example.gestion_inventario.model.entity.Product;
import org.example.gestion_inventario.services.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ProductControllerTest {

    @Mock
    private ProductService productService;

    @InjectMocks
    private ProductController productController;

    private Product testProduct;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        testProduct = new Product(
                "Test Product",
                "Test Description",
                "Test Category",
                BigDecimal.valueOf(100.00),
                10,
                5
        );
        testProduct.setId(1L);
    }

    @Test
    void testGetAll() {
        List<Product> products = Arrays.asList(testProduct);
        when(productService.listAll()).thenReturn(products);

        List<Product> result = productController.all();

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        verify(productService).listAll();
    }

    @Test
    void testCreate() {
        when(productService.create(any(Product.class))).thenReturn(testProduct);

        ResponseEntity<Product> response = productController.create(testProduct);

        assertTrue(response.getStatusCode().is2xxSuccessful());
        assertNotNull(response.getBody());
        assertEquals(testProduct.getName(), response.getBody().getName());
        verify(productService).create(any(Product.class));
    }

    @Test
    void testGetById() {
        when(productService.findById(1L)).thenReturn(testProduct);

        ResponseEntity<Product> response = productController.getById(1L);

        assertTrue(response.getStatusCode().is2xxSuccessful());
        assertNotNull(response.getBody());
        assertEquals(testProduct.getId(), response.getBody().getId());
        verify(productService).findById(1L);
    }

    @Test
    void testUpdate() {
        when(productService.update(eq(1L), any(ProductUpdateDto.class))).thenReturn(testProduct);

        ProductUpdateDto updateDto = new ProductUpdateDto();
        updateDto.setName("Updated Name");

        ResponseEntity<Product> response = productController.update(1L, updateDto);

        assertTrue(response.getStatusCode().is2xxSuccessful());
        assertNotNull(response.getBody());
        verify(productService).update(eq(1L), any(ProductUpdateDto.class));
    }

    @Test
    void testDelete() {
        doNothing().when(productService).delete(1L);

        productController.delete(1L);

        verify(productService).delete(1L);
    }
}