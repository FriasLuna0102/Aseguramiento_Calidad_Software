CREATE TABLE jwt_tokens (
                            token VARCHAR(500) PRIMARY KEY,
                            type VARCHAR(10) NOT NULL,
                            username VARCHAR(50) NOT NULL,
                            valid BOOLEAN DEFAULT TRUE,
                            expiration_date TIMESTAMP NOT NULL
);