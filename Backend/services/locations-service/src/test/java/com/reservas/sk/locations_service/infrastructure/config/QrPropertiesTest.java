package com.reservas.sk.locations_service.infrastructure.config;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class QrPropertiesTest {
    
    @Test
    void shouldCreateQrProperties_whenValidValues() {
        // Act
        QrProperties props = new QrProperties(250, "PNG");
        
        // Assert
        assertEquals(250, props.size());
        assertEquals("PNG", props.format());
    }
    
    @Test
    void shouldCreateQrPropertiesWithDefaults_whenNoArgsConstructor() {
        // Act
        QrProperties props = new QrProperties();
        
        // Assert
        assertEquals(300, props.size());
        assertEquals("PNG", props.format());
    }
    
    @Test
    void shouldThrowException_whenSizeIsZero() {
        // Act & Assert
        assertThrows(IllegalArgumentException.class, 
            () -> new QrProperties(0, "PNG"));
    }
    
    @Test
    void shouldThrowException_whenSizeIsNegative() {
        // Act & Assert
        assertThrows(IllegalArgumentException.class, 
            () -> new QrProperties(-100, "PNG"));
    }
    
    @Test
    void shouldThrowException_whenFormatIsNull() {
        // Act & Assert
        assertThrows(IllegalArgumentException.class, 
            () -> new QrProperties(300, null));
    }
    
    @Test
    void shouldThrowException_whenFormatIsBlank() {
        // Act & Assert
        assertThrows(IllegalArgumentException.class, 
            () -> new QrProperties(300, "   "));
    }
    
    @Test
    void shouldAllowDifferentFormats_whenValidFormat() {
        // Act
        QrProperties props = new QrProperties(300, "JPEG");
        
        // Assert
        assertEquals("JPEG", props.format());
    }
}
