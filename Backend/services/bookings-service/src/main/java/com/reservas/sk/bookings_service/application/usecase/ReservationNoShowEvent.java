package com.reservas.sk.bookings_service.application.usecase;

import java.time.Instant;

/**
 * Event emitted when a reservation is automatically marked as NO_SHOW
 * because the user did not check in within the grace period.
 */
public record ReservationNoShowEvent(
        Long reservationId,
        Long userId,
        Long spaceId,
        Instant startDatetime,
        Instant occurredAt
) {
}
