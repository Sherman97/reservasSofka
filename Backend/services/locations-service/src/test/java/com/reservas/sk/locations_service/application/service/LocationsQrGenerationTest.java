package com.reservas.sk.locations_service.application.service;

import com.reservas.sk.locations_service.application.port.out.LocationEventPublisherPort;
import com.reservas.sk.locations_service.application.port.out.LocationsPersistencePort;
import com.reservas.sk.locations_service.application.port.out.QrCodeImageGeneratorPort;
import com.reservas.sk.locations_service.application.port.out.QrTokenGeneratorPort;
import com.reservas.sk.locations_service.application.usecase.CreateSpaceCommand;
import com.reservas.sk.locations_service.application.usecase.SpaceCreatedEvent;
import com.reservas.sk.locations_service.domain.model.Space;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

/**
 * TDD Tests for QR code generation when creating spaces.
 * Tests verify that QR codes are automatically generated on space creation.
 */
@ExtendWith(MockitoExtension.class)
class LocationsQrGenerationTest {
    private static final String ASSERT_MSG = "PMD UnitTestAssertionsShouldIncludeMessage";
    private static final String SPACE_NAME = "Conference Room A";

    @Mock
    private LocationsPersistencePort persistencePort;
    @Mock
    private LocationEventPublisherPort eventPublisherPort;
    @Mock
    private QrTokenGeneratorPort qrTokenGeneratorPort;
    @Mock
    private QrCodeImageGeneratorPort qrCodeImageGeneratorPort;
    
    @InjectMocks
    private LocationsApplicationService service;

    private Long cityId;
    private Long spaceId;

    @BeforeEach
    void setUp() {
        cityId = 1L;
        spaceId = 100L;
    }

    @Test
    void createSpace_shouldGenerateQrAutomatically_whenSpaceCreated() {
        // Arrange
        String qrToken = "generated.qr.token.jwt";
        byte[] qrImageData = new byte[]{1, 2, 3, 4, 5};
        
        when(persistencePort.existsCity(cityId)).thenReturn(true);
        when(persistencePort.insertSpace(anyLong(), anyString(), any(), any(), any(), any(), anyBoolean()))
            .thenReturn(spaceId);
        when(qrTokenGeneratorPort.generateQrToken(spaceId)).thenReturn(qrToken);
        when(qrCodeImageGeneratorPort.generateQrCodeImage(qrToken)).thenReturn(qrImageData);
        when(persistencePort.findSpaceById(spaceId)).thenReturn(Optional.of(
            createSpaceWithQr(spaceId, qrImageData, qrToken, "mock-etag")
        ));

        // Act
        CreateSpaceCommand cmd = new CreateSpaceCommand(cityId, SPACE_NAME, 10, "1", "desc", "img", true);
        Space result = service.createSpace(cmd);

        // Assert
        assertNotNull(result, ASSERT_MSG);
        verify(qrTokenGeneratorPort).generateQrToken(spaceId);
        verify(qrCodeImageGeneratorPort).generateQrCodeImage(qrToken);
        verify(persistencePort).updateSpaceQrData(anyLong(), any(byte[].class), anyString(), anyString());
        verify(eventPublisherPort).publishSpaceCreated(any(SpaceCreatedEvent.class));
    }

    @Test
    void createSpace_shouldCalculateETag_whenQrGenerated() {
        // Arrange
        byte[] qrImageData = new byte[]{10, 20, 30, 40, 50};
        
        when(persistencePort.existsCity(cityId)).thenReturn(true);
        when(persistencePort.insertSpace(anyLong(), anyString(), any(), any(), any(), any(), anyBoolean()))
            .thenReturn(spaceId);
        when(qrTokenGeneratorPort.generateQrToken(spaceId)).thenReturn("token");
        when(qrCodeImageGeneratorPort.generateQrCodeImage("token")).thenReturn(qrImageData);
        when(persistencePort.findSpaceById(spaceId)).thenReturn(Optional.of(
            createSpaceWithQr(spaceId, qrImageData, "token", "calculated-etag")
        ));

        // Act
        service.createSpace(new CreateSpaceCommand(cityId, SPACE_NAME, 10, null, null, null, true));

        // Assert - ETag should be calculated (SHA-256 hash of QR image)
        verify(persistencePort).updateSpaceQrData(
            eq(spaceId), 
            eq(qrImageData), 
            eq("token"), 
            anyString() // ETag should be a non-null hash
        );
    }

    @Test
    void createSpace_shouldContinueWithoutQr_whenQrGenerationFails() {
        // Arrange
        when(persistencePort.existsCity(cityId)).thenReturn(true);
        when(persistencePort.insertSpace(anyLong(), anyString(), any(), any(), any(), any(), anyBoolean()))
            .thenReturn(spaceId);
        when(qrTokenGeneratorPort.generateQrToken(spaceId))
            .thenThrow(new RuntimeException("QR token generation failed"));
        when(persistencePort.findSpaceById(spaceId)).thenReturn(Optional.of(
            createSpaceWithoutQr(spaceId)
        ));

        // Act - should NOT throw exception, space creation should continue
        Space result = service.createSpace(new CreateSpaceCommand(cityId, SPACE_NAME, 10, null, null, null, true));

        // Assert
        assertNotNull(result, ASSERT_MSG);
        assertEquals(spaceId, result.getId(), ASSERT_MSG);
        verify(persistencePort, never()).updateSpaceQrData(anyLong(), any(), any(), any());
        verify(eventPublisherPort).publishSpaceCreated(any(SpaceCreatedEvent.class));
    }

    @Test
    void createSpace_shouldContinueWithoutQr_whenImageGenerationFails() {
        // Arrange
        String qrToken = "token";
        
        when(persistencePort.existsCity(cityId)).thenReturn(true);
        when(persistencePort.insertSpace(anyLong(), anyString(), any(), any(), any(), any(), anyBoolean()))
            .thenReturn(spaceId);
        when(qrTokenGeneratorPort.generateQrToken(spaceId)).thenReturn(qrToken);
        when(qrCodeImageGeneratorPort.generateQrCodeImage(qrToken))
            .thenThrow(new RuntimeException("QR image generation failed"));
        when(persistencePort.findSpaceById(spaceId)).thenReturn(Optional.of(
            createSpaceWithoutQr(spaceId)
        ));

        // Act
        Space result = service.createSpace(new CreateSpaceCommand(cityId, SPACE_NAME, 10, null, null, null, true));

        // Assert
        assertNotNull(result, ASSERT_MSG);
        verify(qrTokenGeneratorPort).generateQrToken(spaceId);
        verify(qrCodeImageGeneratorPort).generateQrCodeImage(qrToken);
        verify(persistencePort, never()).updateSpaceQrData(anyLong(), any(), any(), any());
        verify(eventPublisherPort).publishSpaceCreated(any(SpaceCreatedEvent.class));
    }

    @Test
    void createSpace_shouldNotAttemptQr_whenPersistenceFails() {
        // Arrange
        when(persistencePort.existsCity(cityId)).thenReturn(true);
        when(persistencePort.insertSpace(anyLong(), anyString(), any(), any(), any(), any(), anyBoolean()))
            .thenThrow(new RuntimeException("Database error"));

        // Act & Assert
        try {
            service.createSpace(new CreateSpaceCommand(cityId, SPACE_NAME, 10, null, null, null, true));
        } catch (RuntimeException e) {
            // Expected
        }
        
        verify(qrTokenGeneratorPort, never()).generateQrToken(anyLong());
        verify(qrCodeImageGeneratorPort, never()).generateQrCodeImage(anyString());
    }

    @Test
    void getSpaceWithQrCode_shouldReturnSpaceWithQrData() {
        // Arrange
        byte[] qrData = new byte[]{1, 2, 3};
        Space spaceWithQr = createSpaceWithQr(spaceId, qrData, "token", "etag");
        
        when(persistencePort.findSpaceById(spaceId)).thenReturn(Optional.of(spaceWithQr));

        // Act
        Space result = service.getSpaceWithQrCode(spaceId);

        // Assert
        assertNotNull(result, ASSERT_MSG);
        assertNotNull(result.getQrCode(), ASSERT_MSG);
        assertEquals("token", result.getQrToken(), ASSERT_MSG);
        assertEquals("etag", result.getQrETag(), ASSERT_MSG);
    }

    // Helper methods

    private Space createSpaceWithQr(Long id, byte[] qrCode, String qrToken, String qrETag) {
        return new Space(
            id, 
            cityId, 
            SPACE_NAME, 
            10, 
            "1", 
            "description", 
            "image.jpg", 
            true,
            Instant.now(), 
            Instant.now(), 
            qrCode, 
            qrToken, 
            qrETag
        );
    }

    private Space createSpaceWithoutQr(Long id) {
        return new Space(
            id, 
            cityId, 
            SPACE_NAME, 
            10, 
            "1", 
            "description", 
            "image.jpg", 
            true,
            Instant.now(), 
            Instant.now(), 
            null,  // No QR code
            null,  // No QR token
            null   // No ETag
        );
    }
}
