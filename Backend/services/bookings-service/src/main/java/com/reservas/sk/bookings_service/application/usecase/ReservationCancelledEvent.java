package com.reservas.sk.bookings_service.application.usecase;

import java.time.Instant;

public record ReservationCancelledEvent(Long reservationId,
                                        Long userId,
                                        Long spaceId,
                                        String status,
                                        String cancellationReason,
                                        Instant occurredAt) {
}




