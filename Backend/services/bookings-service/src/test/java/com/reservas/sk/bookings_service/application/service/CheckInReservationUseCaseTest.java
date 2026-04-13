package com.reservas.sk.bookings_service.application.service;

import com.reservas.sk.bookings_service.application.port.out.BookingPersistencePort;
import com.reservas.sk.bookings_service.application.port.out.QrTokenData;
import com.reservas.sk.bookings_service.application.port.out.QrTokenGeneratorPort;
import com.reservas.sk.bookings_service.application.port.out.ReservationEventPublisherPort;
import com.reservas.sk.bookings_service.application.usecase.CheckInReservationCommand;
import com.reservas.sk.bookings_service.domain.model.Reservation;
import com.reservas.sk.bookings_service.exception.ApiException;
import com.reservas.sk.bookings_service.infrastructure.config.QrProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CheckInReservationUseCaseTest {

    @Mock
    private BookingPersistencePort persistencePort;

    @Mock
    private QrTokenGeneratorPort qrTokenGenerator;

    @Mock
    private ReservationEventPublisherPort eventPublisher;

    private CheckInReservationUseCase useCase;
    private QrProperties qrProperties;

    @BeforeEach
    void setUp() {
        qrProperties = new QrProperties(5, 5); // 5 minutes grace, 5 minutes lead
        useCase = new CheckInReservationUseCase(
                persistencePort,
                qrTokenGenerator,
                eventPublisher,
                qrProperties
        );
    }

    @Test
    void shouldCheckInSuccessfully_whenAllValidationsPass() {
        // Arrange
        Long reservationId = 1L;
        Long userId = 100L;
        Long spaceId = 50L;
        String qrToken = "valid-jwt-token";
        Instant startTime = Instant.now().minus(2, ChronoUnit.MINUTES); // Started 2 minutes ago
        
        Reservation existingReservation = new Reservation(
                reservationId,
                userId,
                spaceId,
                startTime,
                startTime.plus(1, ChronoUnit.HOURS),
                Reservation.STATUS_PENDING,
                "Meeting Room",
                5,
                "Test meeting",
                null,
                Instant.now().minus(1, ChronoUnit.HOURS),
                List.of(),
                null,
                null
        );

        QrTokenData qrData = new QrTokenData(spaceId, "QR_CHECKIN", System.currentTimeMillis() / 1000);

        when(persistencePort.findReservationById(reservationId)).thenReturn(Optional.of(existingReservation));
        when(qrTokenGenerator.validateQrToken(qrToken)).thenReturn(qrData);

        CheckInReservationCommand command = new CheckInReservationCommand(reservationId, userId, qrToken);

        // Act
        Reservation result = useCase.execute(command);

        // Assert
        assertNotNull(result);
        assertEquals(Reservation.STATUS_CHECKED_IN, result.getStatus());
        assertNotNull(result.getCheckedInAt());
        
        verify(persistencePort).updateReservationCheckIn(
                eq(reservationId),
                eq(Reservation.STATUS_CHECKED_IN),
                eq(qrToken),
                any(Instant.class)
        );
        verify(persistencePort).logCheckInAttempt(
                eq(reservationId),
                eq(userId),
                eq(spaceId),
                anyString(),
                eq(true),
                isNull(),
                any(Instant.class)
        );
        
        // Verify event was published
        verify(eventPublisher).publishReservationCheckedIn(argThat(event ->
                event.reservationId().equals(reservationId) &&
                event.userId().equals(userId) &&
                event.spaceId().equals(spaceId) &&
                event.status().equals(Reservation.STATUS_CHECKED_IN) &&
                event.checkedInAt() != null &&
                event.occurredAt() != null
        ));
    }

    @Test
    void shouldThrowException_whenReservationNotFound() {
        // Arrange
        Long reservationId = 999L;
        Long userId = 100L;
        String qrToken = "valid-jwt-token";

        when(persistencePort.findReservationById(reservationId)).thenReturn(Optional.empty());

        CheckInReservationCommand command = new CheckInReservationCommand(reservationId, userId, qrToken);

        // Act & Assert
        ApiException exception = assertThrows(ApiException.class, () -> useCase.execute(command));
        
        assertEquals("RESERVATION_NOT_FOUND", exception.getErrorCode());
        assertEquals(404, exception.getStatus().value());
        verify(persistencePort, never()).updateReservationCheckIn(anyLong(), anyString(), anyString(), any());
    }

    @Test
    void shouldThrowException_whenUserNotOwner() {
        // Arrange
        Long reservationId = 1L;
        Long userId = 100L;
        Long differentUserId = 200L;
        Long spaceId = 50L;
        String qrToken = "valid-jwt-token";
        
        Reservation existingReservation = new Reservation(
                reservationId,
                differentUserId, // Different user owns this reservation
                spaceId,
                Instant.now().minus(2, ChronoUnit.MINUTES),
                Instant.now().plus(1, ChronoUnit.HOURS),
                Reservation.STATUS_PENDING,
                "Meeting Room",
                5,
                null,
                null,
                Instant.now().minus(1, ChronoUnit.HOURS),
                List.of(),
                null,
                null
        );

        when(persistencePort.findReservationById(reservationId)).thenReturn(Optional.of(existingReservation));

        CheckInReservationCommand command = new CheckInReservationCommand(reservationId, userId, qrToken);

        // Act & Assert
        ApiException exception = assertThrows(ApiException.class, () -> useCase.execute(command));
        
        assertEquals("UNAUTHORIZED_USER", exception.getErrorCode());
        assertEquals(403, exception.getStatus().value());
        verify(persistencePort).logCheckInAttempt(
                eq(reservationId),
                eq(userId),
                eq(spaceId),
                anyString(),
                eq(false),
                eq("UNAUTHORIZED_USER"),
                any(Instant.class)
        );
    }

    @Test
    void shouldThrowException_whenQrTokenInvalid() {
        // Arrange
        Long reservationId = 1L;
        Long userId = 100L;
        Long spaceId = 50L;
        String invalidQrToken = "invalid-token";
        
        Reservation existingReservation = new Reservation(
                reservationId,
                userId,
                spaceId,
                Instant.now().minus(2, ChronoUnit.MINUTES),
                Instant.now().plus(1, ChronoUnit.HOURS),
                Reservation.STATUS_PENDING,
                "Meeting Room",
                5,
                null,
                null,
                Instant.now().minus(1, ChronoUnit.HOURS),
                List.of(),
                null,
                null
        );

        when(persistencePort.findReservationById(reservationId)).thenReturn(Optional.of(existingReservation));
        when(qrTokenGenerator.validateQrToken(invalidQrToken)).thenThrow(new RuntimeException("Invalid JWT"));

        CheckInReservationCommand command = new CheckInReservationCommand(reservationId, userId, invalidQrToken);

        // Act & Assert
        ApiException exception = assertThrows(ApiException.class, () -> useCase.execute(command));
        
        assertEquals("QR_TOKEN_INVALID", exception.getErrorCode());
        assertEquals(400, exception.getStatus().value());
        verify(persistencePort).logCheckInAttempt(
                eq(reservationId),
                eq(userId),
                eq(spaceId),
                anyString(),
                eq(false),
                eq("QR_TOKEN_INVALID"),
                any(Instant.class)
        );
    }

    @Test
    void shouldThrowException_whenSpaceIdMismatch() {
        // Arrange
        Long reservationId = 1L;
        Long userId = 100L;
        Long reservationSpaceId = 50L;
        Long qrSpaceId = 99L; // Different space
        String qrToken = "valid-jwt-token";
        
        Reservation existingReservation = new Reservation(
                reservationId,
                userId,
                reservationSpaceId,
                Instant.now().minus(2, ChronoUnit.MINUTES),
                Instant.now().plus(1, ChronoUnit.HOURS),
                Reservation.STATUS_PENDING,
                "Meeting Room",
                5,
                null,
                null,
                Instant.now().minus(1, ChronoUnit.HOURS),
                List.of(),
                null,
                null
        );

        QrTokenData qrData = new QrTokenData(qrSpaceId, "QR_CHECKIN", System.currentTimeMillis() / 1000);

        when(persistencePort.findReservationById(reservationId)).thenReturn(Optional.of(existingReservation));
        when(qrTokenGenerator.validateQrToken(qrToken)).thenReturn(qrData);

        CheckInReservationCommand command = new CheckInReservationCommand(reservationId, userId, qrToken);

        // Act & Assert
        ApiException exception = assertThrows(ApiException.class, () -> useCase.execute(command));
        
        assertEquals("SPACE_MISMATCH", exception.getErrorCode());
        assertEquals(400, exception.getStatus().value());
        verify(persistencePort).logCheckInAttempt(
                eq(reservationId),
                eq(userId),
                eq(reservationSpaceId),
                anyString(),
                eq(false),
                eq("SPACE_MISMATCH"),
                any(Instant.class)
        );
    }

    @Test
    void shouldThrowException_whenReservationNotPending() {
        // Arrange
        Long reservationId = 1L;
        Long userId = 100L;
        Long spaceId = 50L;
        String qrToken = "valid-jwt-token";
        
        Reservation canceledReservation = new Reservation(
                reservationId,
                userId,
                spaceId,
                Instant.now().minus(2, ChronoUnit.MINUTES),
                Instant.now().plus(1, ChronoUnit.HOURS),
                Reservation.STATUS_CANCELED, // Not pending
                "Meeting Room",
                5,
                null,
                "User canceled",
                Instant.now().minus(1, ChronoUnit.HOURS),
                List.of(),
                null,
                null
        );

        QrTokenData qrData = new QrTokenData(spaceId, "QR_CHECKIN", System.currentTimeMillis() / 1000);

        when(persistencePort.findReservationById(reservationId)).thenReturn(Optional.of(canceledReservation));
        when(qrTokenGenerator.validateQrToken(qrToken)).thenReturn(qrData);

        CheckInReservationCommand command = new CheckInReservationCommand(reservationId, userId, qrToken);

        // Act & Assert
        ApiException exception = assertThrows(ApiException.class, () -> useCase.execute(command));
        
        assertEquals("INVALID_RESERVATION_STATUS", exception.getErrorCode());
        assertEquals(409, exception.getStatus().value());
        verify(persistencePort).logCheckInAttempt(
                eq(reservationId),
                eq(userId),
                eq(spaceId),
                anyString(),
                eq(false),
                eq("INVALID_RESERVATION_STATUS"),
                any(Instant.class)
        );
    }

    @Test
    void shouldThrowException_whenOutsideGracePeriod() {
        // Arrange
        Long reservationId = 1L;
        Long userId = 100L;
        Long spaceId = 50L;
        String qrToken = "valid-jwt-token";
        Instant startTime = Instant.now().minus(10, ChronoUnit.MINUTES); // Started 10 minutes ago, grace is 5
        
        Reservation expiredReservation = new Reservation(
                reservationId,
                userId,
                spaceId,
                startTime,
                startTime.plus(1, ChronoUnit.HOURS),
                Reservation.STATUS_PENDING,
                "Meeting Room",
                5,
                null,
                null,
                Instant.now().minus(1, ChronoUnit.HOURS),
                List.of(),
                null,
                null
        );

        QrTokenData qrData = new QrTokenData(spaceId, "QR_CHECKIN", System.currentTimeMillis() / 1000);

        when(persistencePort.findReservationById(reservationId)).thenReturn(Optional.of(expiredReservation));
        when(qrTokenGenerator.validateQrToken(qrToken)).thenReturn(qrData);

        CheckInReservationCommand command = new CheckInReservationCommand(reservationId, userId, qrToken);

        // Act & Assert
        ApiException exception = assertThrows(ApiException.class, () -> useCase.execute(command));
        
        assertEquals("CHECKIN_TIME_WINDOW_MISMATCH", exception.getErrorCode());
        assertEquals(409, exception.getStatus().value());
        verify(persistencePort).logCheckInAttempt(
                eq(reservationId),
                eq(userId),
                eq(spaceId),
                anyString(),
                eq(false),
                eq("CHECKIN_TIME_WINDOW_MISMATCH"),
                any(Instant.class)
        );
    }

    @Test
    void shouldCheckIn_whenExactlyWithinGracePeriod() {
        // ... (previous test code)
    }

    @Test
    void shouldCheckInSuccessfully_whenFourMinutesBeforeStartTime() {
        // Arrange
        Long reservationId = 1L;
        Long userId = 100L;
        Long spaceId = 50L;
        String qrToken = "early-token";
        // Start time is 4 minutes in the future (within 5 min lead time)
        Instant startTime = Instant.now().plus(4, ChronoUnit.MINUTES); 
        
        Reservation existingReservation = new Reservation(
                reservationId,
                userId,
                spaceId,
                startTime,
                startTime.plus(1, ChronoUnit.HOURS),
                Reservation.STATUS_PENDING,
                "Meeting Room",
                5,
                "Early check-in test",
                null,
                Instant.now().minus(1, ChronoUnit.HOURS),
                List.of(),
                null,
                null
        );

        QrTokenData qrData = new QrTokenData(spaceId, "QR_CHECKIN", System.currentTimeMillis() / 1000);

        when(persistencePort.findReservationById(reservationId)).thenReturn(Optional.of(existingReservation));
        when(qrTokenGenerator.validateQrToken(qrToken)).thenReturn(qrData);

        CheckInReservationCommand command = new CheckInReservationCommand(reservationId, userId, qrToken);

        // Act
        Reservation result = useCase.execute(command);

        // Assert
        assertNotNull(result);
        assertEquals(Reservation.STATUS_CHECKED_IN, result.getStatus());
        
        verify(persistencePort).updateReservationCheckIn(
                eq(reservationId),
                eq(Reservation.STATUS_CHECKED_IN),
                eq(qrToken),
                any(Instant.class)
        );
    }

    @Test
    void shouldThrowException_whenTooEarlyBeforeStartTime() {
        // Arrange
        Long reservationId = 1L;
        Long userId = 100L;
        Long spaceId = 50L;
        String qrToken = "too-early-token";
        // Start time is 10 minutes in the future (beyond 5 min lead time)
        Instant startTime = Instant.now().plus(10, ChronoUnit.MINUTES); 
        
        Reservation existingReservation = new Reservation(
                reservationId,
                userId,
                spaceId,
                startTime,
                startTime.plus(1, ChronoUnit.HOURS),
                Reservation.STATUS_PENDING,
                "Meeting Room",
                5,
                null,
                null,
                Instant.now().minus(1, ChronoUnit.HOURS),
                List.of(),
                null,
                null
        );

        QrTokenData qrData = new QrTokenData(spaceId, "QR_CHECKIN", System.currentTimeMillis() / 1000);

        when(persistencePort.findReservationById(reservationId)).thenReturn(Optional.of(existingReservation));
        when(qrTokenGenerator.validateQrToken(qrToken)).thenReturn(qrData);

        CheckInReservationCommand command = new CheckInReservationCommand(reservationId, userId, qrToken);

        // Act & Assert
        ApiException exception = assertThrows(ApiException.class, () -> useCase.execute(command));
        assertEquals("CHECKIN_TIME_WINDOW_MISMATCH", exception.getErrorCode());
        assertEquals(409, exception.getStatus().value());
    }
}
