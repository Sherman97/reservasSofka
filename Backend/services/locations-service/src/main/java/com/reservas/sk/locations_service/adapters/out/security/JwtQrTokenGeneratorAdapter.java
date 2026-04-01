package com.reservas.sk.locations_service.adapters.out.security;

import com.reservas.sk.locations_service.application.port.out.QrTokenGeneratorPort;
import com.reservas.sk.locations_service.infrastructure.config.JwtProperties;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;

/**
 * Adapter for generating QR tokens using JWT.
 * QR tokens are permanent (no expiration) and contain space information.
 */
@Component
public class JwtQrTokenGeneratorAdapter implements QrTokenGeneratorPort {
    
    private static final String TOKEN_TYPE = "QR_CHECKIN";
    private static final String CLAIM_SPACE_ID = "spaceId";
    private static final String CLAIM_TOKEN_TYPE = "tokenType";
    
    private final SecretKey secretKey;
    
    public JwtQrTokenGeneratorAdapter(JwtProperties jwtProperties) {
        this.secretKey = Keys.hmacShaKeyFor(
            jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8)
        );
    }
    
    @Override
    public String generateQrToken(Long spaceId) {
        if (spaceId == null || spaceId <= 0) {
            throw new IllegalArgumentException("spaceId must be positive");
        }
        
        long issuedAt = Instant.now().getEpochSecond();
        
        return Jwts.builder()
            .claim(CLAIM_SPACE_ID, spaceId)
            .claim(CLAIM_TOKEN_TYPE, TOKEN_TYPE)
            .issuedAt(java.util.Date.from(Instant.ofEpochSecond(issuedAt)))
            // NO expiration - QR codes are permanent per space
            .signWith(secretKey)
            .compact();
    }
}
