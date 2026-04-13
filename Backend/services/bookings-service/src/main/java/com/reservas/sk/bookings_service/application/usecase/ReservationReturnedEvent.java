package com.reservas.sk.bookings_service.application.usecase;

import java.time.Instant;

public record ReservationReturnedEvent(Long reservationId,
                                       Long userId,
                                       Long spaceId,
                                       Long staffId,
                                       String status,
                                       String novelty,
                                       String endAt,
                                       Instant occurredAt) {
}

