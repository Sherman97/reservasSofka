package com.reservas.sk.bookings_service.application.usecase;

import java.time.Instant;

public record UpdateReservationCommand(
        Long reservationId,
        Long userId,
        String title,
        Instant startAt,
        Instant endAt,
        Integer attendeesCount,
        String notes
) {
}
