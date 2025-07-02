package org.example.gestion_inventario.model.dto;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Entity
@Table(name = "jwt_tokens")
@Setter
@Getter
public class JwtResponse {
    @Id
    private String token;
    private String type = "Bearer";
    private String username;
    private boolean valid = true;
    private Date expirationDate;


    public JwtResponse(String accessToken, String username, Date expirationDate) {
        this.token = accessToken;
        this.username = username;
        this.expirationDate = expirationDate;
    }

    public JwtResponse() {

    }
}