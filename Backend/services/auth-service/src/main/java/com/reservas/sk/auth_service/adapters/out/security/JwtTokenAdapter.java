package com.reservas.sk.auth_service.adapters.out.security;

import com.reservas.sk.auth_service.application.port.out.TokenPort;
import com.reservas.sk.auth_service.application.usecase.AuthenticatedUser;
import com.reservas.sk.auth_service.domain.model.User;
import com.reservas.sk.auth_service.infrastructure.config.JwtProperties;
import com.reservas.sk.auth_service.exception.ApiException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Component
public class JwtTokenAdapter implements TokenPort {
    private final JwtProperties jwtProperties;
    private SecretKey secretKey;

    public JwtTokenAdapter(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }

    @PostConstruct
    void init() {
        String secret = jwtProperties.getSecret();
        if (secret == null || secret.isBlank()) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "JWT_SECRET no esta configurado");
        }

        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(secret);
        } catch (Exception ignored) {
            keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        }
        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
    }

    @Override
    public String generate(User user) {
        Instant now = Instant.now();
        Instant expiry = now.plus(jwtProperties.getExpiration());

        return Jwts.builder()
                .subject(String.valueOf(user.getId()))
                .claim("email", user.getEmail())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(secretKey)
                .compact();
    }

    @Override
    public AuthenticatedUser parse(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        Long userId = Long.parseLong(claims.getSubject());
        String email = claims.get("email", String.class);
        return new AuthenticatedUser(userId, email);
    }
}





