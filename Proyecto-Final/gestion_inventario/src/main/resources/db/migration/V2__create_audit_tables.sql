CREATE SEQUENCE IF NOT EXISTS revinfo_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE revinfo (
                         id BIGSERIAL PRIMARY KEY,
                         timestamp BIGINT,
                         username VARCHAR(255)
);

CREATE TABLE products_aud (
                              id BIGINT NOT NULL,
                              rev BIGINT NOT NULL REFERENCES revinfo(id),
                              revtype SMALLINT,
                              name VARCHAR(255),
                              description TEXT,
                              category VARCHAR(100),
                              price NUMERIC(12,2),
                              quantity_initial INT,
                              quantity_current INT,
                              stock_minimal_quantity INT,
                              date_created TIMESTAMP,
                              date_updated TIMESTAMP,
                              PRIMARY KEY (id, rev)
);