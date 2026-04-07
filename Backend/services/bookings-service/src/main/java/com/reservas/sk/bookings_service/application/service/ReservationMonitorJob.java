package com.reservas.sk.bookings_service.application.service;

import com.reservas.sk.bookings_service.application.port.out.BookingPersistencePort;
import com.reservas.sk.bookings_service.application.port.out.ReservationEventPublisherPort;
import com.reservas.sk.bookings_service.application.usecase.ReservationNoShowEvent;
import com.reservas.sk.bookings_service.domain.model.Reservation;
import com.reservas.sk.bookings_service.infrastructure.config.QrProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Scheduled job that monitors reservations and automatically marks them as NO_SHOW
 * if the user did not check in within the grace period.
 * 
 * Runs every minute to ensure timely processing of expired reservations.
 * This allows spaces to be released for other users.
 */
@Component
public class ReservationMonitorJob {
    private static final Logger log = LoggerFactory.getLogger(ReservationMonitorJob.class);
    
    private final BookingPersistencePort persistencePort;
    private final ReservationEventPublisherPort eventPublisher;
    private final QrProperties qrProperties;
    
    public ReservationMonitorJob(BookingPersistencePort persistencePort,
                                 ReservationEventPublisherPort eventPublisher,
                                 QrProperties qrProperties) {
        this.persistencePort = persistencePort;
        this.eventPublisher = eventPublisher;
        this.qrProperties = qrProperties;
    }
    
    /**
     * Monitors and marks expired pending reservations as NO_SHOW.
     * Runs every 60 seconds (1 minute).
     * 
     * Process:
     * 1. Find all PENDING reservations past grace period
     * 2. Update status to NO_SHOW in batch
     * 3. Publish events for each reservation
     * 4. Log results
     */
    @Scheduled(fixedRate = 60000) // Run every 60 seconds
    @Transactional
    public void markExpiredReservationsAsNoShow() {
        Instant now = Instant.now();
        
        try {
            // 1. Find expired pending reservations
            List<Reservation> expiredReservations = persistencePort.findExpiredPendingReservations(
                    qrProperties.gracePeriodMinutes()
            );
            
            if (expiredReservations.isEmpty()) {
                log.debug("No expired reservations found - timestamp={}", now);
                return;
            }
            
            // 2. Extract reservation IDs for batch update
            List<Long> reservationIds = expiredReservations.stream()
                    .map(Reservation::getId)
                    .collect(Collectors.toList());
            
            // 3. Update status to NO_SHOW in batch (idempotent - query includes WHERE status = 'pending')
            int updated = persistencePort.updateReservationStatusBatch(
                    reservationIds,
                    Reservation.STATUS_NO_SHOW
            );
            
            if (updated == 0) {
                log.warn("No reservations were updated to NO_SHOW (possible race condition) - attempted={}, timestamp={}",
                        reservationIds.size(), now);
                return;
            }
            
            // 4. Publish events for each reservation (only for successfully updated ones)
            int eventsPublished = 0;
            for (Reservation reservation : expiredReservations) {
                try {
                    eventPublisher.publishReservationNoShow(new ReservationNoShowEvent(
                            reservation.getId(),
                            reservation.getUserId(),
                            reservation.getSpaceId(),
                            reservation.getStartDatetime(),
                            now
                    ));
                    eventsPublished++;
                } catch (Exception e) {
                    log.error("Failed to publish NO_SHOW event - reservationId={}, userId={}, spaceId={}, error={}",
                            reservation.getId(), reservation.getUserId(), reservation.getSpaceId(), 
                            e.getMessage(), e);
                }
            }
            
            // 5. Log summary
            log.info("Marked expired reservations as NO_SHOW - updated={}, eventsPublished={}, gracePeriod={}min, timestamp={}",
                    updated, eventsPublished, qrProperties.gracePeriodMinutes(), now);
            
        } catch (Exception e) {
            log.error("Error in ReservationMonitorJob - timestamp={}, error={}",
                    now, e.getMessage(), e);
            // Don't rethrow - we want the scheduler to continue running
        }
    }
    
    /**
     * Returns the configured grace period in minutes.
     * Used for testing purposes.
     */
    public int getGracePeriodMinutes() {
        return qrProperties.gracePeriodMinutes();
    }
}
