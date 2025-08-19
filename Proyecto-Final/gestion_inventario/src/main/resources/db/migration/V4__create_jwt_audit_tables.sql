CREATE TABLE jwt_tokens_aud (
                                token VARCHAR(500) NOT NULL,
                                rev BIGINT NOT NULL REFERENCES revinfo(id),
                                revtype SMALLINT,
                                type VARCHAR(10),
                                roles VARCHAR(500),
                                username VARCHAR(50),
                                valid BOOLEAN,
                                expiration_date TIMESTAMP,
                                PRIMARY KEY (token, rev)
);