package com.reservas.sk.bookings_service.application.port.out;

/**
 * Port for generating and validating QR tokens.
 * QR tokens are JWT-based and include space information.
 */
public interface QrTokenGeneratorPort {
    
    /**
     * Generates a permanent QR token for a space.
     * The token contains the space ID and never expires.
     * 
     * @param spaceId The space identifier
     * @return A JWT token string
     * @throws IllegalArgumentException if spaceId is invalid
     */
    String generateQrToken(Long spaceId);
    
    /**
     * Validates a QR token and extracts its data.
     * 
     * @param token The JWT token string from the QR code
     * @return The extracted token data
     * @throws com.reservas.sk.bookings_service.exception.BusinessException if token is invalid or signature fails
     */
    QrTokenData validateQrToken(String token);
}
