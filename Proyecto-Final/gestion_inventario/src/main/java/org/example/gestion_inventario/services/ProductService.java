package org.example.gestion_inventario.services;

import io.micrometer.core.annotation.Timed;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.example.gestion_inventario.model.dto.ProductDto;
import org.example.gestion_inventario.model.dto.ProductResponse;
import org.example.gestion_inventario.model.entity.Product;
import org.example.gestion_inventario.repository.ProductRepository;
import org.example.gestion_inventario.specification.ProductSpecification;
import org.example.gestion_inventario.utils.ProductMapper;
import org.hibernate.service.spi.ServiceException;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;
import org.springframework.data.domain.Pageable;


@Service
@Slf4j
public class ProductService {
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    public ProductService(ProductRepository productRepository, ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.productMapper = productMapper;
    }

    @Timed("products.create")
    @Transactional
    public Product create(ProductDto dto) {
        try {
            Product product = new Product();
            product.setName(dto.getName());
            product.setDescription(dto.getDescription());
            product.setCategory(dto.getCategory());
            product.setPrice(dto.getPrice());
            product.setQuantityInitial(dto.getQuantityInitial());
            product.setQuantityCurrent(dto.getQuantityCurrent());

            return productRepository.save(product);
        } catch (Exception e) {
            log.error("Error creating product: ", e);
            throw new ServiceException("Error creating product", e);
        }
    }

    @Timed("products.list")
    public Page<ProductResponse> findAllWithFilters(
            String category,
            String searchTerm,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Pageable pageable
    ) {
        try {
            Specification<Product> spec = Specification.allOf();

            if (category != null) {
                spec = spec.and(ProductSpecification.hasCategory(category));
            }
            if (searchTerm != null) {
                spec = spec.and(ProductSpecification.searchInNameOrDescription(searchTerm));
            }
            if (minPrice != null) {
                spec = spec.and(ProductSpecification.priceGreaterThan(minPrice));
            }
            if (maxPrice != null) {
                spec = spec.and(ProductSpecification.priceLessThan(maxPrice));
            }

            Page<Product> productsPage = productRepository.findAll(spec, pageable);
            return productsPage.map(productMapper::toResponse);
        } catch (Exception e) {
            log.error("Error listing products: ", e);
            throw new ServiceException("Error fetching products", e);
        }
    }

    @Timed("products.update")
    @Transactional
    public Product update(Long id, ProductDto dto) {
        try {
            Product existing = productRepository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + id));

            Optional.ofNullable(dto.getName())
                    .ifPresent(existing::setName);
            Optional.ofNullable(dto.getDescription())
                    .ifPresent(existing::setDescription);
            Optional.ofNullable(dto.getCategory())
                    .ifPresent(existing::setCategory);
            Optional.ofNullable(dto.getPrice())
                    .ifPresent(existing::setPrice);
            Optional.ofNullable(dto.getQuantityInitial())
                    .ifPresent(existing::setQuantityInitial);
            Optional.ofNullable(dto.getQuantityCurrent())
                    .ifPresent(existing::setQuantityCurrent);


            return productRepository.save(existing);
        } catch (EntityNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error updating product: ", e);
            throw new ServiceException("Error updating product", e);
        }
    }

    @Timed("products.getById")
    public ProductResponse findById(Long id) {
        try {
            Product product = productRepository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + id));
            return productMapper.toResponse(product);
        } catch (EntityNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error finding product: ", e);
            throw new ServiceException("Error finding product", e);
        }
    }


    @Timed("products.delete")
    @Transactional
    public void delete(Long id) {
        try {
            if (!productRepository.existsById(id)) {
                throw new EntityNotFoundException("Product not found with id: " + id);
            }
            productRepository.deleteById(id);
        } catch (EntityNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error deleting product: ", e);
            throw new ServiceException("Error deleting product", e);
        }
    }




}
