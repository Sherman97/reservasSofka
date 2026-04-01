package com.reservas.sk.locations_service.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration properties for QR code image generation.
 */
@ConfigurationProperties(prefix = "qr.image")
public record QrProperties(
    int size,
    String format
) {
    public QrProperties {
        if (size <= 0) {
            throw new IllegalArgumentException("QR image size must be positive");
        }
        if (format == null || format.isBlank()) {
            throw new IllegalArgumentException("QR image format cannot be blank");
        }
    }
    
    public QrProperties() {
        this(300, "PNG"); // Default: 300x300 PNG
    }
}
