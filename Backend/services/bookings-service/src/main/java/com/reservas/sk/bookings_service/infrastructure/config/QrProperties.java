package com.reservas.sk.bookings_service.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration properties for QR check-in functionality.
 * Grace period determines how long after start time a user can check in.
 */
@ConfigurationProperties(prefix = "app.qr")
public record QrProperties(
    int gracePeriodMinutes,
    int leadTimeMinutes
) {
    public QrProperties {
        if (gracePeriodMinutes <= 0) {
            throw new IllegalArgumentException("Grace period must be positive");
        }
        if (leadTimeMinutes < 0) {
            throw new IllegalArgumentException("Lead time cannot be negative");
        }
    }
    
}
