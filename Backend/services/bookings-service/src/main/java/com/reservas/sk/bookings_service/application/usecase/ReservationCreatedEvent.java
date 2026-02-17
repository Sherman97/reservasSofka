package com.reservas.sk.bookings_service.application.usecase;

import java.time.Instant;
import java.util.List;

public record ReservationCreatedEvent(Long reservationId,
                                      Long userId,
                                      Long spaceId,
                                      String status,
                                      String startAt,
                                      String endAt,
                                      List<Long> equipmentIds,
                                      Instant occurredAt) {
}




