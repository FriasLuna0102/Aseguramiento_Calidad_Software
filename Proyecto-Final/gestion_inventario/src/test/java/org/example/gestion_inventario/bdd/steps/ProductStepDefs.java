package org.example.gestion_inventario.bdd.steps;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import io.cucumber.java.en.Then;
import io.cucumber.spring.CucumberContextConfiguration;
import org.example.gestion_inventario.GestionInventarioApplication;
import org.example.gestion_inventario.model.entity.Product;
import org.example.gestion_inventario.services.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.math.BigDecimal;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@CucumberContextConfiguration
@SpringBootTest(classes = GestionInventarioApplication.class)
public class ProductStepDefs {

    @Autowired
    private ProductService productService;

    private Product testProduct;
    private Exception thrownException;

    @Given("I want to create a new product")
    public void i_want_to_create_a_new_product() {
        testProduct = null;
        thrownException = null;
    }

    @When("I provide the following product details:")
    public void i_provide_product_details(Map<String, List<String>> productDetails) {
        try {
            System.out.println("Product Details: " + productDetails);

            if (productDetails == null || !productDetails.containsKey("name")) {
                throw new IllegalArgumentException("Product details not provided correctly");
            }

            Product product = new Product(
                    productDetails.get("name") != null ? productDetails.get("name").get(0) : null,
                    productDetails.get("description") != null ? productDetails.get("description").get(0) : null,
                    productDetails.get("category") != null ? productDetails.get("category").get(0) : null,
                    new BigDecimal(productDetails.get("price") != null ? productDetails.get("price").get(0) : "0"),
                    Integer.parseInt(productDetails.get("quantityInitial") != null ? productDetails.get("quantityInitial").get(0) : "0"),
                    Integer.parseInt(productDetails.get("quantityCurrent") != null ? productDetails.get("quantityCurrent").get(0) : "0")
            );
            testProduct = productService.create(product);
        } catch (Exception e) {
            thrownException = e;
            e.printStackTrace();
        }
    }
    @Then("the product should be created successfully")
    public void product_should_be_created() {
        assertNull(thrownException);
        assertNotNull(testProduct);
        assertNotNull(testProduct.getId());
    }

    @Given("there is an existing product")
    public void there_is_an_existing_product() {
        testProduct = productService.create(new Product(
                "Test Product",
                "Test Description",
                "Test Category",
                new BigDecimal("99.99"),
                10,
                10
        ));
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
        assertNull(thrownException);
        assertNotNull(testProduct);
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
        assertNull(thrownException);
        assertThrows(RuntimeException.class, () -> {
            productService.findById(testProduct.getId());
        });
    }
}