package org.example.gestion_inventario.services;

import io.micrometer.core.annotation.Timed;
import org.example.gestion_inventario.model.entity.JwtResponse;
import org.example.gestion_inventario.repository.JwtRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
public class JwtServices {
    private final JwtRepository jwtRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private static final String REDIS_PREFIX = "jwt:";
    private static final Logger logger = LoggerFactory.getLogger(JwtServices.class);


    public JwtServices(JwtRepository jwtRepository, RedisTemplate<String, Object> redisTemplate) {
        this.jwtRepository = jwtRepository;
        this.redisTemplate = redisTemplate;
    }

    @Timed("jwt.saveToken")
    public void saveToken(JwtResponse jwtResponse) {
        jwtRepository.save(jwtResponse);

        try {
            String redisKey = REDIS_PREFIX + jwtResponse.getToken();
            redisTemplate.opsForValue().set(
                    redisKey,
                    "valid",
                    getTimeUntilExpiration(jwtResponse.getExpirationDate()),
                    TimeUnit.MILLISECONDS
            );
        } catch (Exception e) {
            logger.warn("Could not save token to Redis: {}", e.getMessage());
        }
    }

    @Timed("jwt.invalidateToken")
    public void invalidateToken(String token) {
        Optional<JwtResponse> jwtResponse = jwtRepository.findById(token);
        jwtResponse.ifPresent(jwt -> {
            jwt.setValid(false);
            jwtRepository.save(jwt);
        });

        redisTemplate.delete(REDIS_PREFIX + token);

    }

    @Timed("jwt.isTokenValid")
    public boolean isTokenValid(String token) {
        try {
            String redisKey = REDIS_PREFIX + token;
            Object cachedValue = redisTemplate.opsForValue().get(redisKey);

            if (cachedValue != null) {
                return true;
            }
        } catch (Exception e) {
            logger.warn("Could not check token in Redis: {}", e.getMessage());
        }

        Optional<JwtResponse> jwtResponse = jwtRepository.findById(token);
        boolean isValid = jwtResponse.map(JwtResponse::isValid).orElse(false);

        if (isValid) {
            try {
                jwtResponse.ifPresent(jwt ->
                        redisTemplate.opsForValue().set(
                                REDIS_PREFIX + token,
                                "valid",
                                getTimeUntilExpiration(jwt.getExpirationDate()),
                                TimeUnit.MILLISECONDS
                        )
                );
            } catch (Exception e) {
                logger.warn("Could not cache valid token in Redis: {}", e.getMessage());
            }
        }

        return isValid;
    }

    @Timed("jwt.getExpirationTime")
    private long getTimeUntilExpiration(Date expirationDate) {
        return Math.max(0, expirationDate.getTime() - System.currentTimeMillis());
    }
}