package org.example.gestion_inventario.services;

import io.micrometer.core.annotation.Timed;
import jakarta.persistence.EntityNotFoundException;
import org.example.gestion_inventario.model.entity.JwtResponse;
import org.example.gestion_inventario.repository.JwtRepository;
import org.example.gestion_inventario.specification.JwtSpecification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
    @Transactional
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
    @Transactional
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

    @Timed("jwt.getAllTokens")
    public List<JwtResponse> getAllTokens() {
        return jwtRepository.findAll();
    }

    @Timed("jwt.findAllWithFilters")
    public Page<JwtResponse> findAllWithFilters(
            String username,
            Boolean valid,
            Boolean expired,
            String searchTerm,
            Pageable pageable
    ) {
        try {
            Specification<JwtResponse> spec = Specification.<JwtResponse>allOf();

            if (username != null && !username.trim().isEmpty()) {
                spec = spec.and(JwtSpecification.hasUsername(username));
            }
            if (valid != null) {
                spec = spec.and(JwtSpecification.isValid(valid));
            }
            if (expired != null) {
                if (expired) {
                    spec = spec.and(JwtSpecification.isExpired());
                } else {
                    spec = spec.and(JwtSpecification.isNotExpired());
                }
            }
            if (searchTerm != null && !searchTerm.trim().isEmpty()) {
                spec = spec.and(JwtSpecification.searchInUsernameOrToken(searchTerm));
            }

            return jwtRepository.findAll(spec, pageable);
        } catch (Exception e) {
            logger.error("Error finding tokens with filters: ", e);
            throw new RuntimeException("Error fetching tokens", e);
        }
    }

    @Timed("jwt.findByToken")
    public JwtResponse findByToken(String token) {
        return jwtRepository.findById(token)
                .orElseThrow(() -> new EntityNotFoundException("Token not found: " + token));
    }

    @Timed("jwt.findExpiredTokens")
    public Page<JwtResponse> findExpiredTokens(Pageable pageable) {
        return jwtRepository.findAll(JwtSpecification.isExpired(), pageable);
    }

    @Timed("jwt.findActiveTokens")
    public Page<JwtResponse> findActiveTokens(Pageable pageable) {
        Specification<JwtResponse> spec = Specification.<JwtResponse>allOf();
        spec = spec.and(JwtSpecification.isValid(true));
        spec = spec.and(JwtSpecification.isNotExpired());

        return jwtRepository.findAll(spec, pageable);
    }

    @Timed("jwt.findByUsername")
    public Page<JwtResponse> findByUsername(String username, Pageable pageable) {
        return jwtRepository.findAll(JwtSpecification.hasUsername(username), pageable);
    }

    @Timed("jwt.invalidateAllTokensForUser")
    @Transactional
    public int invalidateAllTokensForUser(String username) {
        List<JwtResponse> userTokens = jwtRepository.findAll(JwtSpecification.hasUsername(username));

        for (JwtResponse token : userTokens) {
            if (token.isValid()) {
                token.setValid(false);
                jwtRepository.save(token);
                redisTemplate.delete(REDIS_PREFIX + token.getToken());
            }
        }

        return (int) userTokens.stream().filter(JwtResponse::isValid).count();
    }

    @Timed("jwt.cleanupExpiredTokens")
    @Transactional
    public int cleanupExpiredTokens() {
        List<JwtResponse> expiredTokens = jwtRepository.findAll(JwtSpecification.isExpired());

        for (JwtResponse token : expiredTokens) {
            redisTemplate.delete(REDIS_PREFIX + token.getToken());
        }

        jwtRepository.deleteAll(expiredTokens);
        return expiredTokens.size();
    }

    @Timed("jwt.getTokenStatistics")
    public Map<String, Long> getTokenStatistics() {
        Map<String, Long> stats = new HashMap<>();

        stats.put("total", jwtRepository.count());
        stats.put("valid", jwtRepository.count(JwtSpecification.isValid(true)));
        stats.put("invalid", jwtRepository.count(JwtSpecification.isValid(false)));
        stats.put("expired", jwtRepository.count(JwtSpecification.isExpired()));
        stats.put("active", jwtRepository.count(
                Specification.<JwtResponse>allOf()
                        .and(JwtSpecification.isValid(true))
                        .and(JwtSpecification.isNotExpired())
        ));

        return stats;
    }
}