package org.example.gestion_inventario.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;

import java.util.ArrayList;
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

    @Column(name = "roles")
    private String rolesString;

    public JwtResponse(String accessToken, String username, Date expirationDate) {
        this.token = accessToken;
        this.username = username;
        this.expirationDate = expirationDate;
    }
    public JwtResponse(String accessToken, String username, Date expirationDate, List<String> roles) {
        this.token = accessToken;
        this.username = username;
        this.expirationDate = expirationDate;
        this.setRoles(roles);

    }


    public JwtResponse() {

    }

    @Transient
    public List<String> getRoles() {
        if (rolesString == null || rolesString.trim().isEmpty()) {
            return new ArrayList<>();
        }
        return List.of(rolesString.split(","));
    }

    @Transient
    public void setRoles(List<String> roles) {
        if (roles == null || roles.isEmpty()) {
            this.rolesString = "";
        } else {
            this.rolesString = String.join(",", roles);
        }
    }
}