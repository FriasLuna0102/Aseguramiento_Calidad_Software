package org.example.gestion_inventario.bdd.steps;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import io.cucumber.java.en.Then;
import org.example.gestion_inventario.GestionInventarioApplication;
import org.example.gestion_inventario.model.dto.ProductDto;
import org.example.gestion_inventario.model.dto.ProductResponse;
import org.example.gestion_inventario.services.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import jakarta.persistence.EntityNotFoundException;

import java.util.List;
import java.math.BigDecimal;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(classes = GestionInventarioApplication.class)
public class ProductStepDefs {

    @Autowired
    private ProductService productService;

    private ProductResponse testProduct;
    private Exception thrownException;
    private ProductDto productDto;

    @Given("I want to create a new product")
    public void i_want_to_create_a_new_product() {
        testProduct = null;
        thrownException = null;
        productDto = null;
    }



    @When("I provide the following product details:")
    public void i_provide_product_details(Map<String, List<String>> productDetails) {
        try {
            System.out.println("Product Details: " + productDetails);

            String name = productDetails.keySet().stream()
                    .filter(key -> !key.equals("name"))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Product name not found"));

            List<String> values = productDetails.get(name);

            productDto = new ProductDto();
            productDto.setName(name);
            productDto.setDescription(values.get(0));
            productDto.setCategory(values.get(1));
            productDto.setPrice(new BigDecimal(values.get(2)));
            productDto.setQuantityInitial(Integer.parseInt(values.get(3)));
            productDto.setQuantityCurrent(Integer.parseInt(values.get(4)));

            System.out.println("Created DTO: " +
                    "name=" + productDto.getName() +
                    ", description=" + productDto.getDescription() +
                    ", category=" + productDto.getCategory() +
                    ", price=" + productDto.getPrice() +
                    ", quantityInitial=" + productDto.getQuantityInitial() +
                    ", quantityCurrent=" + productDto.getQuantityCurrent());

            testProduct = productService.create(productDto);

            if (testProduct == null) {
                throw new RuntimeException("Failed to create product");
            }
        } catch (Exception e) {
            thrownException = e;
            System.err.println("Error creating product: " + e.getMessage());
            e.printStackTrace();
        }
    }


    @Then("the product should be created successfully")
    public void product_should_be_created() {
        if (thrownException != null) {
            fail("Exception occurred: " + thrownException.getMessage());
        }
        assertNotNull(testProduct, "Product should not be null");
        assertNotNull(testProduct.getId(), "Product ID should not be null");

        assertEquals(productDto.getName(), testProduct.getName(), "Name mismatch");
        assertEquals(productDto.getDescription(), testProduct.getDescription(), "Description mismatch");
        assertEquals(productDto.getCategory(), testProduct.getCategory(), "Category mismatch");
        assertEquals(0, productDto.getPrice().compareTo(testProduct.getPrice()), "Price mismatch");
        assertEquals(productDto.getQuantityInitial(), testProduct.getQuantityInitial(), "Initial quantity mismatch");
        assertEquals(productDto.getQuantityCurrent(), testProduct.getQuantityCurrent(), "Current quantity mismatch");
    }

    @Given("there is an existing product")
    public void there_is_an_existing_product() {
        productDto = new ProductDto();
        productDto.setName("Test Product");
        productDto.setDescription("Test Description");
        productDto.setCategory("Test Category");
        productDto.setPrice(new BigDecimal("99.99"));
        productDto.setQuantityInitial(10);
        productDto.setQuantityCurrent(10);

        testProduct = productService.create(productDto);
    }

    @When("I request the product details")
    public void i_request_the_product_details() {
        try {
            testProduct = productService.findById(testProduct.getId());
        } catch (Exception e) {
            thrownException = e;
        }
    }

    @Then("I should receive the correct product information")
    public void i_should_receive_the_correct_product_information() {
        assertNull(thrownException, "No exception should be thrown");
        assertNotNull(testProduct, "Product should not be null");
        assertEquals(productDto.getName(), testProduct.getName());
        assertEquals(productDto.getDescription(), testProduct.getDescription());
        assertEquals(productDto.getCategory(), testProduct.getCategory());
        assertEquals(productDto.getPrice(), testProduct.getPrice());
        assertEquals(productDto.getQuantityInitial(), testProduct.getQuantityInitial());
        assertEquals(productDto.getQuantityCurrent(), testProduct.getQuantityCurrent());
    }

    @When("I delete the product")
    public void i_delete_the_product() {
        try {
            productService.delete(testProduct.getId());
        } catch (Exception e) {
            thrownException = e;
        }
    }

    @Then("the product should be removed from the system")
    public void product_should_be_removed_from_the_system() {
        assertNull(thrownException, "No exception should be thrown during deletion");
        assertThrows(EntityNotFoundException.class, () -> {
            productService.findById(testProduct.getId());
        }, "Should throw EntityNotFoundException when trying to find deleted product");
    }

    @When("I update the product with new details:")
    public void i_update_the_product_with_new_details(Map<String, List<String>> productDetails) {
        try {
            String name = productDetails.keySet().stream()
                    .filter(key -> !key.equals("name"))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Product name not found"));

            List<String> values = productDetails.get(name);

            ProductDto updateDto = new ProductDto();
            updateDto.setName(name);
            updateDto.setDescription(values.get(0));
            updateDto.setCategory(values.get(1));
            updateDto.setPrice(new BigDecimal(values.get(2)));
            updateDto.setQuantityInitial(Integer.parseInt(values.get(3)));
            updateDto.setQuantityCurrent(Integer.parseInt(values.get(4)));

            testProduct = productService.update(testProduct.getId(), updateDto);
            productDto = updateDto;

            if (testProduct == null) {
                throw new RuntimeException("Failed to update product");
            }
        } catch (Exception e) {
            thrownException = e;
            System.err.println("Error updating product: " + e.getMessage());
            e.printStackTrace();
        }
    }


    @Then("the product should be updated successfully")
    public void the_product_should_be_updated_successfully() {
        if (thrownException != null) {
            fail("Exception occurred: " + thrownException.getMessage());
        }
        assertNotNull(testProduct, "Updated product should not be null");

        assertEquals(productDto.getName(), testProduct.getName(), "Name mismatch");
        assertEquals(productDto.getDescription(), testProduct.getDescription(), "Description mismatch");
        assertEquals(productDto.getCategory(), testProduct.getCategory(), "Category mismatch");
        assertEquals(0, productDto.getPrice().compareTo(testProduct.getPrice()), "Price mismatch");
        assertEquals(productDto.getQuantityInitial(), testProduct.getQuantityInitial(), "Initial quantity mismatch");
        assertEquals(productDto.getQuantityCurrent(), testProduct.getQuantityCurrent(), "Current quantity mismatch");
    }
}