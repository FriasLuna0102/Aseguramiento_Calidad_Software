CREATE TABLE products (
                          id BIGSERIAL PRIMARY KEY,  -- Cambia de AUTO_INCREMENT a BIGSERIAL
                          name VARCHAR(255) NOT NULL,
                          description TEXT,
                          category VARCHAR(100),
                          price NUMERIC(12,2),
                          quantity_initial INT,
                          quantity_current INT
);