CREATE SEQUENCE IF NOT EXISTS revinfo_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE revinfo (
                         rev BIGSERIAL PRIMARY KEY,
                         revtstmp BIGINT
);

CREATE TABLE products_aud (
                              id BIGINT NOT NULL,
                              rev BIGINT NOT NULL REFERENCES revinfo(rev),
                              revtype SMALLINT,
                              name VARCHAR(255),
                              description TEXT,
                              category VARCHAR(100),
                              price NUMERIC(12,2),
                              quantity_initial INT,
                              quantity_current INT,
                              PRIMARY KEY (id, rev)
);