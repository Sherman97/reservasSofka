package com.reservas.sk.bookings_service.application.port.out;

import com.reservas.sk.bookings_service.domain.model.Reservation;
import com.reservas.sk.bookings_service.domain.model.ReservationEquipment;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface BookingPersistencePort {
    boolean userExists(long userId);

    Optional<Long> findSpaceCityId(long spaceId);

    int countOverlappingReservations(long spaceId, Instant startAt, Instant endAt);

    List<Long> findExistingEquipmentIds(List<Long> equipmentIds);

    List<Long> findUnavailableEquipmentIds(List<Long> equipmentIds);

    List<Long> findEquipmentIdsOutsideCity(List<Long> equipmentIds, long cityId);

    // Human Check 🛡️: Se agrego caso de uso por espacio para evitar doble reserva por concurrencia.
    boolean acquireSpaceReservationLock(long spaceId, int timeoutSeconds);

    void releaseSpaceReservationLock(long spaceId);

    long insertReservation(long userId,
                           long spaceId,
                           Instant startAt,
                           Instant endAt,
                           String status,
                           String title,
                           Integer attendeesCount,
                           String notes);

    void insertReservationEquipment(long reservationId, long equipmentId, String status);

    void updateReservation(long reservationId,
                           String title,
                           Instant startAt,
                           Instant endAt,
                           Integer attendeesCount,
                           String notes);

    List<Reservation> listReservations(Long userId, Long spaceId, String status);

    Optional<Reservation> findReservationById(long reservationId);

    Map<Long, List<ReservationEquipment>> findReservationEquipmentsByReservationIds(List<Long> reservationIds);

    List<ReservationEquipment> findReservationEquipments(long reservationId);

    void updateReservationCancellation(long reservationId, String status, String cancellationReason);

    void updateReservationStatus(long reservationId, String status);

    /**
     * Updates a reservation status with check-in timestamp.
     * 
     * @param reservationId The reservation ID
     * @param status The new status
     * @param qrToken The QR token used for check-in (for audit)
     * @param checkedInAt The check-in timestamp (UTC)
     */
    void updateReservationCheckIn(long reservationId, String status, String qrToken, Instant checkedInAt);

    /**
     * Batch update reservations to NO_SHOW status for expired pending reservations.
     * 
     * @param reservationIds List of reservation IDs to update
     * @param newStatus The new status (typically NO_SHOW)
     * @return Number of reservations updated
     */
    int updateReservationStatusBatch(List<Long> reservationIds, String newStatus);

    /**
     * Find reservations that are pending and have passed the grace period.
     * 
     * @param gracePeriodMinutes The grace period in minutes after start time
     * @return List of expired pending reservations
     */
    List<Reservation> findExpiredPendingReservations(int gracePeriodMinutes);

    /**
     * Logs a check-in attempt for auditing purposes.
     * 
     * @param reservationId The reservation ID
     * @param userId The user ID attempting check-in
     * @param spaceId The space ID from the reservation
     * @param qrToken Prefix of the QR token (first 10 chars for security)
     * @param success Whether the check-in was successful
     * @param failureReason The reason if failed (null if success)
     * @param attemptAt The timestamp of the attempt (UTC)
     */
    void logCheckInAttempt(long reservationId, long userId, long spaceId, String qrToken, 
                           boolean success, String failureReason, Instant attemptAt);

    void markReservationEquipmentsDelivered(long reservationId, long deliveredBy, Instant deliveredAt, String novelty);

    void markReservationEquipmentsReturned(long reservationId, long returnedBy, Instant returnedAt, String novelty);

    void insertReservationHandoverLog(long reservationId,
                                      long spaceId,
                                      long userId,
                                      long staffId,
                                      String action,
                                      String novelty,
                                      Instant eventAt);
}








