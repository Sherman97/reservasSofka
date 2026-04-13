package com.reservas.sk.bookings_service.infrastructure.config;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class QrPropertiesTest {
    
    @Test
    void shouldCreateQrProperties_whenValidValues() {
        // Act
        QrProperties props = new QrProperties(10, 5);
        
        // Assert
        assertEquals(10, props.gracePeriodMinutes());
        assertEquals(5, props.leadTimeMinutes());
    }
    
    @Test
    void shouldThrowException_whenGracePeriodIsZero() {
        // Act & Assert
        assertThrows(IllegalArgumentException.class, 
            () -> new QrProperties(0, 5));
    }
    
    @Test
    void shouldThrowException_whenGracePeriodIsNegative() {
        // Act & Assert
        assertThrows(IllegalArgumentException.class, 
            () -> new QrProperties(-5, 5));
    }

    @Test
    void shouldThrowException_whenLeadTimeIsNegative() {
        // Act & Assert
        assertThrows(IllegalArgumentException.class, 
            () -> new QrProperties(5, -1));
    }
    
    @Test
    void shouldAllowLargeGracePeriod_whenPositiveValue() {
        // Act
        QrProperties props = new QrProperties(60, 15);
        
        // Assert
        assertEquals(60, props.gracePeriodMinutes());
        assertEquals(15, props.leadTimeMinutes());
    }
}
