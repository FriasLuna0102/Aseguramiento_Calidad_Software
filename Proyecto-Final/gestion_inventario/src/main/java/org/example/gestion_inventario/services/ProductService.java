package org.example.gestion_inventario.services;

import io.micrometer.core.annotation.Timed;
import org.example.gestion_inventario.model.entity.Product;
import org.example.gestion_inventario.repository.ProductRepository;
import org.springframework.stereotype.Service;

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

    @Timed("products.delete")
    public void delete(Long id) {
        productRepository.deleteById(id);
    }


}
