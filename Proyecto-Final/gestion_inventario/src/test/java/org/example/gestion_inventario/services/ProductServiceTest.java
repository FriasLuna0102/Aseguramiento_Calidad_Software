package org.example.gestion_inventario.services;

import org.example.gestion_inventario.model.dto.ProductUpdateDto;
import org.example.gestion_inventario.model.entity.Product;
import org.example.gestion_inventario.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

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
    void testCreateProduct() {
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        Product created = productService.create(testProduct);

        assertNotNull(created);
        assertEquals(testProduct.getName(), created.getName());
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void testListAll() {
        List<Product> products = Arrays.asList(testProduct);
        when(productRepository.findAll()).thenReturn(products);

        List<Product> result = productService.listAll();

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        verify(productRepository).findAll();
    }

    @Test
    void testFindById() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));

        Product found = productService.findById(1L);

        assertNotNull(found);
        assertEquals(testProduct.getId(), found.getId());
        verify(productRepository).findById(1L);
    }

    @Test
    void testFindByIdNotFound() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> {
            productService.findById(99L);
        });
    }

    @Test
    void testUpdate() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(testProduct));
        when(productRepository.save(any(Product.class))).thenReturn(testProduct);

        ProductUpdateDto updateDto = new ProductUpdateDto();
        updateDto.setName("Updated Name");
        updateDto.setPrice(BigDecimal.valueOf(200.00));

        Product updated = productService.update(1L, updateDto);

        assertNotNull(updated);
        assertEquals("Updated Name", updated.getName());
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void testDelete() {
        when(productRepository.existsById(1L)).thenReturn(true);

        productService.delete(1L);

        verify(productRepository).deleteById(1L);
    }

    @Test
    void testDeleteNotFound() {
        when(productRepository.existsById(99L)).thenReturn(false);

        assertThrows(ResponseStatusException.class, () -> {
            productService.delete(99L);
        });
    }
}