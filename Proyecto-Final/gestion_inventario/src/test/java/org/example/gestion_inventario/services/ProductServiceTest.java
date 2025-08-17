package org.example.gestion_inventario.services;

import jakarta.persistence.EntityNotFoundException;
import org.example.gestion_inventario.model.dto.ProductDto;
import org.example.gestion_inventario.model.dto.ProductResponse;
import org.example.gestion_inventario.model.entity.Product;
import org.example.gestion_inventario.repository.ProductRepository;
import org.example.gestion_inventario.utils.ProductMapper;
import org.hibernate.service.spi.ServiceException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductMapper productMapper;

    @InjectMocks
    private ProductService productService;

    private Product testProduct;
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

        testProduct = new Product();
        testProduct.setId(1L);
        testProduct.setName(testProductDto.getName());
        testProduct.setDescription(testProductDto.getDescription());
        testProduct.setCategory(testProductDto.getCategory());
        testProduct.setPrice(testProductDto.getPrice());
        testProduct.setQuantityInitial(testProductDto.getQuantityInitial());
        testProduct.setQuantityCurrent(testProductDto.getQuantityCurrent());
        testProduct.setStockMinimalQuantity(testProductDto.getStockMinimalQuantity());

        testProductResponse = ProductResponse.builder()
                .id(testProduct.getId())
                .name(testProduct.getName())
                .description(testProduct.getDescription())
                .category(testProduct.getCategory())
                .price(testProduct.getPrice())
                .quantityInitial(testProduct.getQuantityInitial())
                .quantityCurrent(testProduct.getQuantityCurrent())
                .stockMinimalQuantity(testProduct.getStockMinimalQuantity())
                .build();
    }

    @Test
    void testCreateProduct_Success() {
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);
        when(productMapper.toResponse(testProduct)).thenReturn(testProductResponse);

        ProductResponse created = productService.create(testProductDto);

        assertNotNull(created);
        assertEquals(testProductDto.getName(), created.getName());
        assertEquals(testProductDto.getPrice(), created.getPrice());
        verify(productRepository).save(any(Product.class));
        verify(productMapper).toResponse(any(Product.class));
    }

    @Test
    void testCreateProduct_ThrowsServiceException() {
        when(productRepository.save(any(Product.class))).thenThrow(new RuntimeException("Database error"));

        assertThrows(ServiceException.class, () -> productService.create(testProductDto));
    }

    @Test
    void testFindAllWithFilters_NoFilters() {
        Pageable pageable = PageRequest.of(0, 10, Sort.Direction.ASC, "id");
        Page<Product> productPage = new PageImpl<>(
                Arrays.asList(testProduct),
                pageable,
                1
        );

        when(productRepository.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(productPage);
        when(productMapper.toResponse(testProduct)).thenReturn(testProductResponse);

        Page<ProductResponse> result = productService.findAllWithFilters(
                null,
                null,
                null,
                null,
                pageable
        );

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(testProductResponse.getName(), result.getContent().get(0).getName());
        verify(productRepository).findAll(any(Specification.class), eq(pageable));
        verify(productMapper).toResponse(any(Product.class));
    }

    @Test
    void testFindAllWithFilters_WithAllFilters() {
        Pageable pageable = PageRequest.of(0, 10, Sort.Direction.ASC, "name");
        Page<Product> productPage = new PageImpl<>(
                Arrays.asList(testProduct),
                pageable,
                1
        );

        when(productRepository.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(productPage);
        when(productMapper.toResponse(testProduct)).thenReturn(testProductResponse);

        Page<ProductResponse> result = productService.findAllWithFilters(
                "Test Category",
                "Test",
                BigDecimal.valueOf(50.0),
                BigDecimal.valueOf(150.0),
                pageable
        );

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(productRepository).findAll(any(Specification.class), eq(pageable));
        verify(productMapper).toResponse(any(Product.class));
    }

    @Test
    void testFindAllWithFilters_ThrowsServiceException() {
        Pageable pageable = PageRequest.of(0, 10);
        when(productRepository.findAll(any(Specification.class), eq(pageable)))
                .thenThrow(new RuntimeException("Database error"));

        assertThrows(ServiceException.class, () ->
                productService.findAllWithFilters(null, null, null, null, pageable)
        );
    }

    @Test
    void testFindById_Success() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(productMapper.toResponse(testProduct)).thenReturn(testProductResponse);

        ProductResponse found = productService.findById(1L);

        assertNotNull(found);
        assertEquals(testProductResponse.getId(), found.getId());
        verify(productRepository).findById(1L);
        verify(productMapper).toResponse(testProduct);
    }

    @Test
    void testFindById_NotFound() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> productService.findById(99L));
    }

    @Test
    void testUpdate_Success() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);
        when(productMapper.toResponse(testProduct)).thenReturn(testProductResponse);

        ProductDto updateDto = new ProductDto();
        updateDto.setName("Updated Name");
        updateDto.setPrice(BigDecimal.valueOf(200.00));

        ProductResponse updated = productService.update(1L, updateDto);

        assertNotNull(updated);
        assertEquals(testProductResponse.getName(), updated.getName());
        verify(productRepository).save(any(Product.class));
        verify(productMapper).toResponse(any(Product.class));
    }

    @Test
    void testUpdate_NotFound() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class,
                () -> productService.update(99L, testProductDto));
    }

    @Test
    void testDelete_Success() {
        when(productRepository.existsById(1L)).thenReturn(true);

        productService.delete(1L);

        verify(productRepository).deleteById(1L);
    }

    @Test
    void testDelete_NotFound() {
        when(productRepository.existsById(99L)).thenReturn(false);

        assertThrows(EntityNotFoundException.class, () -> productService.delete(99L));
    }

    @Test
    void testDelete_ThrowsServiceException() {
        when(productRepository.existsById(1L)).thenReturn(true);
        doThrow(new RuntimeException("Database error")).when(productRepository).deleteById(1L);

        assertThrows(ServiceException.class, () -> productService.delete(1L));
    }
}