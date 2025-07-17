Feature: Product Management

  Scenario: Create a new product
    Given I want to create a new product
    When I provide the following product details:
      | name         | description      | category | price | quantityInitial | quantityCurrent |
      | Test Product | Test Description | Test     | 99.99 | 10             | 10             |
    Then the product should be created successfully

  Scenario: Get product by ID
    Given there is an existing product
    When I request the product details
    Then I should receive the correct product information

  Scenario: Delete a product
    Given there is an existing product
    When I delete the product
    Then the product should be removed from the system

  Scenario: Update a product
    Given there is an existing product
    When I update the product with new details:
      | name           | description          | category    | price | quantityInitial | quantityCurrent |
      | Updated Product| Updated Description  | Updated Cat | 149.99| 20             | 15             |
    Then the product should be updated successfully