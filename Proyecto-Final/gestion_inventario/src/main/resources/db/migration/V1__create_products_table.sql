CREATE TABLE products (
                          id BIGSERIAL PRIMARY KEY,
                          name VARCHAR(255) NOT NULL,
                          description TEXT,
                          category VARCHAR(100),
                          price NUMERIC(12,2),
                          quantity_initial INT,
                          quantity_current INT,
                          stock_minimal_quantity INT
);