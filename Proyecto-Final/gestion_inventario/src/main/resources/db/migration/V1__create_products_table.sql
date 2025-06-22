CREATE TABLE products (
                          id SERIAL PRIMARY KEY,
                          name VARCHAR(255) NOT NULL,
                          description TEXT,
                          category VARCHAR(100),
                          price NUMERIC(12,2),
                          quantityInitial INT,
                          quantityCurrent INT
);
