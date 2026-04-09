package com.reservas.sk.bookings_service.application.service;

import com.reservas.sk.bookings_service.application.port.out.BookingPersistencePort;
import com.reservas.sk.bookings_service.application.port.out.QrTokenData;
import com.reservas.sk.bookings_service.application.port.out.QrTokenGeneratorPort;
import com.reservas.sk.bookings_service.application.port.out.ReservationEventPublisherPort;
import com.reservas.sk.bookings_service.application.usecase.CheckInReservationCommand;
import com.reservas.sk.bookings_service.domain.model.Reservation;
import com.reservas.sk.bookings_service.exception.ApiException;
import com.reservas.sk.bookings_service.infrastructure.config.QrProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Use case for checking in a reservation using a QR code.
 * This service validates the QR token, verifies reservation permissions,
 * and updates the reservation status to CHECKED_IN.
 */
@Service
public class CheckInReservationUseCase {
    private static final Logger log = LoggerFactory.getLogger(CheckInReservationUseCase.class);
    
    private final BookingPersistencePort persistencePort;
    private final QrTokenGeneratorPort qrTokenGenerator;
    private final ReservationEventPublisherPort eventPublisher;
    private final QrProperties qrProperties;

    public CheckInReservationUseCase(BookingPersistencePort persistencePort,
                                     QrTokenGeneratorPort qrTokenGenerator,
                                     ReservationEventPublisherPort eventPublisher,
                                     QrProperties qrProperties) {
        this.persistencePort = persistencePort;
        this.qrTokenGenerator = qrTokenGenerator;
        this.eventPublisher = eventPublisher;
        this.qrProperties = qrProperties;
    }

    /**
     * Checks in a reservation using a QR code token.
     * 
     * @param command The check-in command with reservation ID, user ID, and QR token
     * @return The updated reservation with CHECKED_IN status
     * @throws ApiException if validation fails
     */
    @Transactional
    public Reservation execute(CheckInReservationCommand command) {
        Instant now = Instant.now();
        
        // 1. Validate and fetch reservation
        Reservation reservation = persistencePort.findReservationById(command.reservationId())
                .orElseThrow(() -> {
                    log.warn("Check-in attempt failed - reservationId={}, reason=RESERVATION_NOT_FOUND, timestamp={}",
                            command.reservationId(), now);
                    return new ApiException(HttpStatus.NOT_FOUND, "Reserva no encontrada", "RESERVATION_NOT_FOUND");
                });

        // 2. Validate user ownership
        if (!reservation.getUserId().equals(command.userId())) {
            log.warn("Check-in attempt failed - reservationId={}, userId={}, reason=UNAUTHORIZED_USER, timestamp={}",
                    command.reservationId(), command.userId(), now);
            persistencePort.logCheckInAttempt(
                    command.reservationId(),
                    command.userId(),
                    reservation.getSpaceId(),
                    safePrefix(command.qrToken()),
                    false,
                    "UNAUTHORIZED_USER",
                    now
            );
            throw new ApiException(HttpStatus.FORBIDDEN, "No tiene permisos para esta reserva", "UNAUTHORIZED_USER");
        }

        // 3. Validate and extract QR token data
        QrTokenData qrData;
        try {
            qrData = qrTokenGenerator.validateQrToken(command.qrToken());
        } catch (Exception e) {
            log.warn("Check-in attempt failed - reservationId={}, userId={}, spaceId={}, qrTokenPrefix={}, reason=QR_TOKEN_INVALID, timestamp={}",
                    command.reservationId(), command.userId(), reservation.getSpaceId(), safePrefix(command.qrToken()), now);
            persistencePort.logCheckInAttempt(
                    command.reservationId(),
                    command.userId(),
                    reservation.getSpaceId(),
                    safePrefix(command.qrToken()),
                    false,
                    "QR_TOKEN_INVALID",
                    now
            );
            throw new ApiException(HttpStatus.BAD_REQUEST, "Código QR inválido o corrupto", "QR_TOKEN_INVALID");
        }

        // 4. Validate space ID matches
        if (!qrData.spaceId().equals(reservation.getSpaceId())) {
            log.warn("Check-in attempt failed - reservationId={}, userId={}, spaceId={}, qrSpaceId={}, reason=SPACE_MISMATCH, timestamp={}",
                    command.reservationId(), command.userId(), reservation.getSpaceId(), qrData.spaceId(), now);
            persistencePort.logCheckInAttempt(
                    command.reservationId(),
                    command.userId(),
                    reservation.getSpaceId(),
                    safePrefix(command.qrToken()),
                    false,
                    "SPACE_MISMATCH",
                    now
            );
            throw new ApiException(HttpStatus.BAD_REQUEST, 
                    "El código QR no corresponde a esta reserva", 
                    "SPACE_MISMATCH");
        }

        // 5. Validate reservation status is PENDING
        if (!Reservation.STATUS_PENDING.equals(reservation.getStatus())) {
            log.warn("Check-in attempt failed - reservationId={}, userId={}, spaceId={}, currentStatus={}, reason=INVALID_RESERVATION_STATUS, timestamp={}",
                    command.reservationId(), command.userId(), reservation.getSpaceId(), reservation.getStatus(), now);
            persistencePort.logCheckInAttempt(
                    command.reservationId(),
                    command.userId(),
                    reservation.getSpaceId(),
                    safePrefix(command.qrToken()),
                    false,
                    "INVALID_RESERVATION_STATUS",
                    now
            );
            throw new ApiException(HttpStatus.CONFLICT, 
                    "La reserva no está en estado pendiente", 
                    "INVALID_RESERVATION_STATUS");
        }

        // 6. Validate time: within [start - leadTime, start + gracePeriod]
        int gracePeriod = qrProperties != null ? qrProperties.gracePeriodMinutes() : 5;
        int leadTime = qrProperties != null ? qrProperties.leadTimeMinutes() : 5;
        
        // Ensure values are sane even if bound incorrectly
        gracePeriod = gracePeriod <= 0 ? 5 : gracePeriod;
        leadTime = leadTime < 0 ? 5 : leadTime;

        if (!reservation.canCheckIn(now, gracePeriod, leadTime)) {
            log.warn("Check-in attempt failed - reservationId={}, userId={}, spaceId={}, startTime={}, currentTime={}, gracePeriod={}, leadTime={}, reason=CHECKIN_TIME_WINDOW_MISMATCH, timestamp={}",
                    command.reservationId(), command.userId(), reservation.getSpaceId(), 
                    reservation.getStartDatetime(), now, gracePeriod, leadTime, now);
            persistencePort.logCheckInAttempt(
                    command.reservationId(),
                    command.userId(),
                    reservation.getSpaceId(),
                    safePrefix(command.qrToken()),
                    false,
                    "CHECKIN_TIME_WINDOW_MISMATCH",
                    now
            );
            throw new ApiException(HttpStatus.CONFLICT, 
                    "La reserva no está dentro del período de check-in permitido (Margen de 5 min)", 
                    "CHECKIN_TIME_WINDOW_MISMATCH");
        }

        // 7. Update reservation status to CHECKED_IN
        persistencePort.updateReservationCheckIn(
                command.reservationId(),
                Reservation.STATUS_CHECKED_IN,
                command.qrToken(),
                now
        );

        // 8. Log success
        log.info("Check-in successful - reservationId={}, userId={}, spaceId={}, timestamp={}",
                command.reservationId(), command.userId(), reservation.getSpaceId(), now);
        persistencePort.logCheckInAttempt(
                command.reservationId(),
                command.userId(),
                reservation.getSpaceId(),
                safePrefix(command.qrToken()),
                true,
                null,
                now
        );

        // 9. Return updated reservation
        Reservation updatedReservation = reservation.checkIn(now);

        // 10. Publish event
        eventPublisher.publishReservationCheckedIn(new com.reservas.sk.bookings_service.application.usecase.ReservationCheckedInEvent(
                updatedReservation.getId(),
                updatedReservation.getUserId(),
                updatedReservation.getSpaceId(),
                updatedReservation.getStatus(),
                updatedReservation.getCheckedInAt(),
                now
        ));

        return updatedReservation;
    }

    /**
     * Returns first 10 characters of QR token for logging (security).
     */
    private String safePrefix(String token) {
        if (token == null || token.isEmpty()) {
            return "null";
        }
        return token.length() > 10 ? token.substring(0, 10) : token;
    }
}
