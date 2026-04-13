package com.reservas.sk.locations_service.adapters.out.qr;

import com.reservas.sk.locations_service.infrastructure.config.QrProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class QrCodeImageGeneratorAdapterTest {
    
    private QrCodeImageGeneratorAdapter adapter;
    private QrProperties qrProperties;
    
    @BeforeEach
    void setUp() {
        qrProperties = new QrProperties(300, "PNG");
        adapter = new QrCodeImageGeneratorAdapter(qrProperties);
    }
    
    @Test
    void shouldGenerateQrCodeImage_whenValidToken() {
        // Arrange
        String token = "valid.jwt.token";
        
        // Act
        byte[] qrImage = adapter.generateQrCodeImage(token);
        
        // Assert
        assertNotNull(qrImage);
        assertTrue(qrImage.length > 0);
        // PNG header starts with bytes: 137, 80, 78, 71
        assertEquals((byte) 137, qrImage[0]);
        assertEquals((byte) 80, qrImage[1]);
        assertEquals((byte) 78, qrImage[2]);
        assertEquals((byte) 71, qrImage[3]);
    }
    
    @Test
    void shouldThrowException_whenTokenIsNull() {
        // Act & Assert
        assertThrows(IllegalArgumentException.class, 
            () -> adapter.generateQrCodeImage(null));
    }
    
    @Test
    void shouldThrowException_whenTokenIsBlank() {
        // Act & Assert
        assertThrows(IllegalArgumentException.class, 
            () -> adapter.generateQrCodeImage("   "));
    }
    
    @Test
    void shouldGenerateDifferentImages_whenDifferentTokens() {
        // Arrange
        String token1 = "first.jwt.token";
        String token2 = "second.jwt.token";
        
        // Act
        byte[] image1 = adapter.generateQrCodeImage(token1);
        byte[] image2 = adapter.generateQrCodeImage(token2);
        
        // Assert
        assertNotNull(image1);
        assertNotNull(image2);
        assertFalse(java.util.Arrays.equals(image1, image2));
    }
    
    @Test
    void shouldGenerateSameImage_whenSameTokenCalledTwice() {
        // Arrange
        String token = "same.jwt.token";
        
        // Act
        byte[] image1 = adapter.generateQrCodeImage(token);
        byte[] image2 = adapter.generateQrCodeImage(token);
        
        // Assert
        assertArrayEquals(image1, image2);
    }
    
    @Test
    void shouldGenerateImageWithConfiguredSize_whenCustomProperties() {
        // Arrange
        QrProperties customProps = new QrProperties(200, "PNG");
        QrCodeImageGeneratorAdapter customAdapter = new QrCodeImageGeneratorAdapter(customProps);
        String token = "test.token";
        
        // Act
        byte[] qrImage = customAdapter.generateQrCodeImage(token);
        
        // Assert
        assertNotNull(qrImage);
        assertTrue(qrImage.length > 0);
    }
    
    @Test
    void shouldHandleLongToken_whenTokenExceedsNormalLength() {
        // Arrange
        String longToken = "very.long.jwt.token.".repeat(50);
        
        // Act
        byte[] qrImage = adapter.generateQrCodeImage(longToken);
        
        // Assert
        assertNotNull(qrImage);
        assertTrue(qrImage.length > 0);
    }
}
