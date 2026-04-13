package com.reservas.sk.bookings_service.application.usecase;

import java.time.Instant;

/**
 * Event emitted when a reservation is checked in using QR code.
 */
public record ReservationCheckedInEvent(
        Long reservationId,
        Long userId,
        Long spaceId,
        String status,
        Instant checkedInAt,
        Instant occurredAt
) {
}
