package com.reservas.sk.bookings_service.infrastructure.config;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class QrPropertiesTest {
    
    @Test
    void shouldCreateQrProperties_whenValidValues() {
        // Act
        QrProperties props = new QrProperties(10);
        
        // Assert
        assertEquals(10, props.gracePeriodMinutes());
    }
    
    @Test
    void shouldCreateQrPropertiesWithDefaults_whenNoArgsConstructor() {
        // Act
        QrProperties props = new QrProperties();
        
        // Assert
        assertEquals(5, props.gracePeriodMinutes());
    }
    
    @Test
    void shouldThrowException_whenGracePeriodIsZero() {
        // Act & Assert
        assertThrows(IllegalArgumentException.class, 
            () -> new QrProperties(0));
    }
    
    @Test
    void shouldThrowException_whenGracePeriodIsNegative() {
        // Act & Assert
        assertThrows(IllegalArgumentException.class, 
            () -> new QrProperties(-5));
    }
    
    @Test
    void shouldAllowLargeGracePeriod_whenPositiveValue() {
        // Act
        QrProperties props = new QrProperties(60);
        
        // Assert
        assertEquals(60, props.gracePeriodMinutes());
    }
}
