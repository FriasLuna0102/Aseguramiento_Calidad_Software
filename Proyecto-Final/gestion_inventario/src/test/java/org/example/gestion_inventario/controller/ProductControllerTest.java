package org.example.gestion_inventario.controller;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import org.example.gestion_inventario.model.dto.ProductDto;
import org.example.gestion_inventario.model.dto.ProductResponse;
import org.example.gestion_inventario.model.entity.Product;
import org.example.gestion_inventario.services.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class ProductControllerTest {

    @Mock
    private ProductService productService;

    @Mock
    private EntityManager entityManager;

    @InjectMocks
    private ProductController productController;

    private ProductDto testProductDto;
    private ProductResponse testProductResponse;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        testProductDto = new ProductDto();
        testProductDto.setName("Test Product");
        testProductDto.setDescription("Test Description");
        testProductDto.setCategory("Test Category");
        testProductDto.setPrice(BigDecimal.valueOf(100.00));
        testProductDto.setQuantityInitial(10);
        testProductDto.setQuantityCurrent(5);
        testProductDto.setStockMinimalQuantity(25);

        testProductResponse = ProductResponse.builder()
                .id(1L)
                .name(testProductDto.getName())
                .description(testProductDto.getDescription())
                .category(testProductDto.getCategory())
                .price(testProductDto.getPrice())
                .quantityInitial(testProductDto.getQuantityInitial())
                .quantityCurrent(testProductDto.getQuantityCurrent())
                .stockMinimalQuantity(testProductDto.getStockMinimalQuantity())
                .build();
    }

    @Test
    void testGetAll_Success() {
        Pageable pageable = PageRequest.of(0, 10, Sort.Direction.ASC, "id");
        Page<ProductResponse> productPage = new PageImpl<>(
                Arrays.asList(testProductResponse),
                pageable,
                1
        );

        when(productService.findAllWithFilters(
                isNull(),
                isNull(),
                isNull(),
                isNull(),
                eq(pageable)
        )).thenReturn(productPage);

        ResponseEntity<Page<ProductResponse>> response = productController.all(
                null,
                null,
                null,
                null,
                0,
                10,
                "id",
                "asc"
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getTotalElements());
        assertEquals(testProductResponse.getName(), response.getBody().getContent().get(0).getName());
    }

    @Test
    void testGetAll_WithFilters() {
        Pageable pageable = PageRequest.of(0, 10, Sort.Direction.ASC, "name");
        Page<ProductResponse> productPage = new PageImpl<>(
                Arrays.asList(testProductResponse),
                pageable,
                1
        );

        when(productService.findAllWithFilters(
                eq("Test Category"),
                eq("Test"),
                eq(BigDecimal.valueOf(50.0)),
                eq(BigDecimal.valueOf(150.0)),
                eq(pageable)
        )).thenReturn(productPage);

        ResponseEntity<Page<ProductResponse>> response = productController.all(
                "Test Category",
                "Test",
                BigDecimal.valueOf(50.0),
                BigDecimal.valueOf(150.0),
                0,
                10,
                "name",
                "asc"
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getTotalElements());
    }

    @Test
    void testCreate_Success() {
        when(productService.create(any(ProductDto.class))).thenReturn(testProductResponse);

        ResponseEntity<ProductResponse> response = productController.create(testProductDto);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(testProductResponse.getName(), response.getBody().getName());
        verify(productService).create(any(ProductDto.class));
    }

    @Test
    void testGetById_Success() {
        when(productService.findById(1L)).thenReturn(testProductResponse);

        ResponseEntity<ProductResponse> response = productController.getById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(testProductResponse.getId(), response.getBody().getId());
        verify(productService).findById(1L);
    }

    @Test
    void testGetById_NotFound() {
        when(productService.findById(999L))
                .thenThrow(new EntityNotFoundException("Product not found"));

        assertThrows(EntityNotFoundException.class, () ->
                productController.getById(999L)
        );
        verify(productService).findById(999L);
    }

    @Test
    void testUpdate_Success() {
        when(productService.update(eq(1L), any(ProductDto.class))).thenReturn(testProductResponse);

        ResponseEntity<ProductResponse> response = productController.update(1L, testProductDto);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(testProductResponse.getName(), response.getBody().getName());
        verify(productService).update(eq(1L), any(ProductDto.class));
    }

    @Test
    void testUpdate_NotFound() {
        when(productService.update(eq(999L), any(ProductDto.class)))
                .thenThrow(new EntityNotFoundException("Product not found"));

        assertThrows(EntityNotFoundException.class, () ->
                productController.update(999L, testProductDto)
        );
        verify(productService).update(eq(999L), any(ProductDto.class));
    }

    @Test
    void testDelete_Success() {
        doNothing().when(productService).delete(1L);

        ResponseEntity<Void> response = productController.delete(1L);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(productService).delete(1L);
    }

    @Test
    void testDelete_NotFound() {
        doThrow(new EntityNotFoundException("Product not found"))
                .when(productService).delete(999L);

        assertThrows(EntityNotFoundException.class, () ->
                productController.delete(999L)
        );
        verify(productService).delete(999L);
    }
}