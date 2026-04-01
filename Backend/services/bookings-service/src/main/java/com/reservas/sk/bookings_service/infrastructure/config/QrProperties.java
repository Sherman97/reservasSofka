package com.reservas.sk.bookings_service.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration properties for QR check-in functionality.
 * Grace period determines how long after start time a user can check in.
 */
@ConfigurationProperties(prefix = "qr.checkin")
public record QrProperties(
    int gracePeriodMinutes
) {
    public QrProperties {
        if (gracePeriodMinutes <= 0) {
            throw new IllegalArgumentException("Grace period must be positive");
        }
    }
    
    public QrProperties() {
        this(5); // Default: 5 minutes grace period
    }
}
