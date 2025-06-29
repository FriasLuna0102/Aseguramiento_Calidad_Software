package org.example.gestion_inventario.services;

import io.micrometer.core.annotation.Timed;
import org.example.gestion_inventario.model.dto.ProductUpdateDto;
import org.example.gestion_inventario.model.entity.Product;
import org.example.gestion_inventario.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Timed("products.create")
    public Product create(Product p) {
        return productRepository.save(p);
    }

    @Timed("products.list")
    public List<Product> listAll() {
        return productRepository.findAll();
    }

    @Timed("products.update")
    @Transactional
    public Product update(Long id, ProductUpdateDto dto) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Producto no encontrado"));

        existing.setName(dto.getName());
        if (dto.getPrice() != null)         existing.setPrice(dto.getPrice());
        if (dto.getDescription() != null)   existing.setDescription(dto.getDescription());
        if (dto.getCategory() != null)      existing.setCategory(dto.getCategory());
        if (dto.getQuantityInitial() != null)
            existing.setQuantityInitial(dto.getQuantityInitial());
        if (dto.getQuantityCurrent() != null)
            existing.setQuantityCurrent(dto.getQuantityCurrent());

        return productRepository.save(existing);
    }

    @Timed("products.getById")
    public Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Producto no encontrado"));
    }


    @Timed("products.delete")
    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado");
        }
        productRepository.deleteById(id);
    }


}
