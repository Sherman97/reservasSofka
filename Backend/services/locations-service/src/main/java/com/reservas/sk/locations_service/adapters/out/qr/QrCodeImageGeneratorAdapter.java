package com.reservas.sk.locations_service.adapters.out.qr;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.reservas.sk.locations_service.application.port.out.QrCodeImageGeneratorPort;
import com.reservas.sk.locations_service.infrastructure.config.QrProperties;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Map;

/**
 * Adapter for generating QR code images using ZXing library.
 * Implements the Facade pattern to simplify QR generation.
 */
@Component
public class QrCodeImageGeneratorAdapter implements QrCodeImageGeneratorPort {
    
    private final QrProperties qrProperties;
    private final QRCodeWriter qrCodeWriter;
    
    public QrCodeImageGeneratorAdapter(QrProperties qrProperties) {
        this.qrProperties = qrProperties;
        this.qrCodeWriter = new QRCodeWriter();
    }
    
    @Override
    public byte[] generateQrCodeImage(String token) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Token cannot be blank");
        }
        
        try {
            Map<EncodeHintType, Object> hints = Map.of(
                EncodeHintType.CHARACTER_SET, "UTF-8",
                EncodeHintType.MARGIN, 1
            );
            
            BitMatrix bitMatrix = qrCodeWriter.encode(
                token,
                BarcodeFormat.QR_CODE,
                qrProperties.size(),
                qrProperties.size(),
                hints
            );
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, qrProperties.format(), outputStream);
            
            return outputStream.toByteArray();
            
        } catch (WriterException e) {
            throw new IllegalArgumentException("Failed to generate QR code: " + e.getMessage(), e);
        } catch (IOException e) {
            throw new RuntimeException("Failed to write QR code to byte array: " + e.getMessage(), e);
        }
    }
}
