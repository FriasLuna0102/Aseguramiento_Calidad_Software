package org.example.gestion_inventario.model.dto;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.envers.Audited;

import java.util.Date;
import java.util.List;

@Entity
@Table(name = "jwt_tokens")
@Audited
@Setter
@Getter
public class JwtResponse {
    @Id
    private String token;
    private String type = "Bearer";
    private String username;
    private boolean valid = true;
    private Date expirationDate;
    @ElementCollection
    @CollectionTable(
            name = "jwt_roles",
            joinColumns = @JoinColumn(name = "token_id")
    )
    @Column(name = "role")
    private List<String> roles;

    public JwtResponse(String accessToken, String username, Date expirationDate) {
        this.token = accessToken;
        this.username = username;
        this.expirationDate = expirationDate;
    }
    public JwtResponse(String accessToken, String username, Date expirationDate, List<String> roles) {
        this.token = accessToken;
        this.username = username;
        this.expirationDate = expirationDate;
        this.roles = roles;
    }


    public JwtResponse() {

    }
}