package com.reservas.sk.bookings_service.adapters.out.security;

import com.reservas.sk.bookings_service.application.port.out.QrTokenData;
import com.reservas.sk.bookings_service.exception.BusinessException;
import com.reservas.sk.bookings_service.infrastructure.config.JwtProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtQrTokenGeneratorAdapterTest {
    
    private JwtQrTokenGeneratorAdapter adapter;
    private JwtProperties jwtProperties;
    
    @BeforeEach
    void setUp() {
        jwtProperties = new JwtProperties();
        jwtProperties.setSecret("test-secret-key-must-be-at-least-256-bits");
        adapter = new JwtQrTokenGeneratorAdapter(jwtProperties);
    }
    
    @Test
    void shouldGenerateValidQrToken_whenValidSpaceId() {
        // Arrange
        Long spaceId = 123L;
        
        // Act
        String token = adapter.generateQrToken(spaceId);
        
        // Assert
        assertNotNull(token);
        assertFalse(token.isBlank());
        assertTrue(token.split("\\.").length == 3); // JWT has 3 parts
    }
    
    @Test
    void shouldValidateQrToken_whenValidToken() {
        // Arrange
        Long spaceId = 456L;
        String token = adapter.generateQrToken(spaceId);
        
        // Act
        QrTokenData data = adapter.validateQrToken(token);
        
        // Assert
        assertNotNull(data);
        assertEquals(spaceId, data.spaceId());
        assertEquals("QR_CHECKIN", data.tokenType());
        assertTrue(data.issuedAt() > 0);
    }
    
    @Test
    void shouldThrowException_whenGeneratingWithNullSpaceId() {
        // Act & Assert
        assertThrows(IllegalArgumentException.class, 
            () -> adapter.generateQrToken(null));
    }
    
    @Test
    void shouldThrowException_whenGeneratingWithZeroSpaceId() {
        // Act & Assert
        assertThrows(IllegalArgumentException.class, 
            () -> adapter.generateQrToken(0L));
    }
    
    @Test
    void shouldThrowException_whenGeneratingWithNegativeSpaceId() {
        // Act & Assert
        assertThrows(IllegalArgumentException.class, 
            () -> adapter.generateQrToken(-1L));
    }
    
    @Test
    void shouldThrowBusinessException_whenValidatingNullToken() {
        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class, 
            () -> adapter.validateQrToken(null));
        assertEquals("QR_TOKEN_INVALID", exception.getCode());
    }
    
    @Test
    void shouldThrowBusinessException_whenValidatingBlankToken() {
        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class, 
            () -> adapter.validateQrToken("   "));
        assertEquals("QR_TOKEN_INVALID", exception.getCode());
    }
    
    @Test
    void shouldThrowBusinessException_whenValidatingInvalidSignature() {
        // Arrange
        String tokenWithWrongSignature = "eyJhbGciOiJIUzI1NiJ9.eyJzcGFjZUlkIjoxMjMsInRva2VuVHlwZSI6IlFSX0NIRUNLSU4ifQ.invalid";
        
        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class, 
            () -> adapter.validateQrToken(tokenWithWrongSignature));
        assertEquals("QR_TOKEN_INVALID", exception.getCode());
    }
    
    @Test
    void shouldThrowBusinessException_whenValidatingMalformedToken() {
        // Arrange
        String malformedToken = "not.a.jwt.token.at.all";
        
        // Act & Assert
        BusinessException exception = assertThrows(BusinessException.class, 
            () -> adapter.validateQrToken(malformedToken));
        assertEquals("QR_TOKEN_INVALID", exception.getCode());
    }
    
    @Test
    void shouldGenerateDifferentTokens_whenSameSpaceIdCalledTwice() {
        // Arrange
        Long spaceId = 789L;
        
        // Act
        String token1 = adapter.generateQrToken(spaceId);
        try {
            Thread.sleep(1000); // Ensure different issuedAt timestamp
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        String token2 = adapter.generateQrToken(spaceId);
        
        // Assert
        assertNotEquals(token1, token2); // Different due to different issuedAt
    }
    
    @Test
    void shouldExtractCorrectSpaceId_whenMultipleTokensGenerated() {
        // Arrange & Act
        String token1 = adapter.generateQrToken(111L);
        String token2 = adapter.generateQrToken(222L);
        String token3 = adapter.generateQrToken(333L);
        
        QrTokenData data1 = adapter.validateQrToken(token1);
        QrTokenData data2 = adapter.validateQrToken(token2);
        QrTokenData data3 = adapter.validateQrToken(token3);
        
        // Assert
        assertEquals(111L, data1.spaceId());
        assertEquals(222L, data2.spaceId());
        assertEquals(333L, data3.spaceId());
    }
}
