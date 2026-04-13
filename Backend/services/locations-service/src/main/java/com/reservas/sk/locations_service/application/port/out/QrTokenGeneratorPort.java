package com.reservas.sk.locations_service.application.port.out;

/**
 * Port for generating QR tokens.
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
}
