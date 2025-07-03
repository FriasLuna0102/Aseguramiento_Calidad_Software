CREATE TABLE jwt_tokens_aud (
                                token VARCHAR(500) NOT NULL,
                                rev INTEGER NOT NULL REFERENCES revinfo(rev),
                                revtype SMALLINT,
                                type VARCHAR(10),
                                username VARCHAR(50),
                                valid BOOLEAN,
                                expiration_date TIMESTAMP,
                                PRIMARY KEY (token, rev)
);