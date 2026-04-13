package com.reservas.sk.bookings_service.application.port.out;

/**
 * Data extracted from a QR token.
 * 
 * @param spaceId The space ID embedded in the QR token
 * @param tokenType The type of token (should be "QR_CHECKIN")
 * @param issuedAt The timestamp when the token was issued (epoch seconds)
 */
public record QrTokenData(
    Long spaceId,
    String tokenType,
    long issuedAt
) {
    public QrTokenData {
        if (spaceId == null || spaceId <= 0) {
            throw new IllegalArgumentException("spaceId must be positive");
        }
        if (tokenType == null || tokenType.isBlank()) {
            throw new IllegalArgumentException("tokenType cannot be blank");
        }
    }
}
