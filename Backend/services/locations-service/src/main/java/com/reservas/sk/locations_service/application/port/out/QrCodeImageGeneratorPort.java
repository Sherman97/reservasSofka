package com.reservas.sk.locations_service.application.port.out;

/**
 * Port for generating QR code images.
 */
public interface QrCodeImageGeneratorPort {
    
    /**
     * Generates a QR code image from a token string.
     * 
     * @param token The token to encode in the QR code
     * @return Byte array of the QR code image (PNG format)
     * @throws IllegalArgumentException if token is invalid
     */
    byte[] generateQrCodeImage(String token);
}
