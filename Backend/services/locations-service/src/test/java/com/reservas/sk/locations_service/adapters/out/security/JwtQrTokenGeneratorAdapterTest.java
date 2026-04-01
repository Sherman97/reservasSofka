package com.reservas.sk.locations_service.adapters.out.security;

import com.reservas.sk.locations_service.infrastructure.config.JwtProperties;
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
    void shouldGenerateConsistentFormat_whenMultipleSpaceIds() {
        // Arrange & Act
        String token1 = adapter.generateQrToken(111L);
        String token2 = adapter.generateQrToken(999999L);
        
        // Assert
        assertTrue(token1.split("\\.").length == 3);
        assertTrue(token2.split("\\.").length == 3);
    }
}
