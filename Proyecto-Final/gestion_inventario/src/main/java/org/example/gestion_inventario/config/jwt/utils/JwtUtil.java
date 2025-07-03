package org.example.gestion_inventario.config.jwt.utils;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.example.gestion_inventario.model.dto.JwtResponse;
import org.example.gestion_inventario.services.JwtServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private int jwtExpirationMs;

    @Value("${jwt.issuer}")
    private String jwtIssuer;

    private final JwtServices jwtServices;

    public JwtUtil(JwtServices jwtServices) {
        this.jwtServices = jwtServices;
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        String token = generateTokenFromUsername(userPrincipal.getUsername(), userPrincipal.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));

        Date expirationDate = new Date(new Date().getTime() + jwtExpirationMs);
        jwtServices.saveToken(new JwtResponse(token, userPrincipal.getUsername(), expirationDate));

        return token;
    }

    public String generateTokenFromUsername(String username, java.util.List<String> roles) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", roles);

        return Jwts.builder()
                .claims(claims)
                .subject(username)
                .issuer(jwtIssuer)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    public String getUserNameFromJwtToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    @SuppressWarnings("unchecked")
    public java.util.List<String> getRolesFromJwtToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return (java.util.List<String>) claims.get("roles");
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(authToken);

            return jwtServices.isTokenValid(authToken);
        } catch (Exception e) {
            System.err.println("Error validating JWT token: " + e.getMessage());
            return false;
        }
    }

    public Date getExpirationDateFromJwtToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getExpiration();
    }
}