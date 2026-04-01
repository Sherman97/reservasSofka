package com.reservas.sk.bookings_service.adapters.out.security;

import com.reservas.sk.bookings_service.application.port.out.QrTokenData;
import com.reservas.sk.bookings_service.application.port.out.QrTokenGeneratorPort;
import com.reservas.sk.bookings_service.exception.BusinessException;
import com.reservas.sk.bookings_service.infrastructure.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;

/**
 * Adapter for generating and validating QR tokens using JWT.
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
    
    @Override
    public QrTokenData validateQrToken(String token) {
        if (token == null || token.isBlank()) {
            throw new BusinessException("QR_TOKEN_INVALID", "QR token cannot be blank");
        }
        
        try {
            Claims claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
            
            Object spaceIdObj = claims.get(CLAIM_SPACE_ID);
            Object tokenTypeObj = claims.get(CLAIM_TOKEN_TYPE);
            
            if (spaceIdObj == null) {
                throw new BusinessException("QR_TOKEN_INVALID", "QR token missing spaceId");
            }
            
            if (!TOKEN_TYPE.equals(tokenTypeObj)) {
                throw new BusinessException("QR_TOKEN_INVALID", 
                    "Invalid token type: expected " + TOKEN_TYPE + ", got " + tokenTypeObj);
            }
            
            Long spaceId = ((Number) spaceIdObj).longValue();
            long issuedAt = claims.getIssuedAt() != null 
                ? claims.getIssuedAt().toInstant().getEpochSecond() 
                : 0;
            
            return new QrTokenData(spaceId, TOKEN_TYPE, issuedAt);
            
        } catch (JwtException e) {
            throw new BusinessException("QR_TOKEN_INVALID", 
                "Invalid QR token signature or format: " + e.getMessage());
        }
    }
}
