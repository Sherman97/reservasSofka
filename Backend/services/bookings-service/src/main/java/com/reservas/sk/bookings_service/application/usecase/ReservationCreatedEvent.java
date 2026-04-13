package com.reservas.sk.bookings_service.application.usecase;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public record ReservationCreatedEvent(Long reservationId,
                                      Long userId,
                                      Long spaceId,
                                      String status,
                                      String startAt,
                                      String endAt,
                                      List<Long> equipmentIds,
                                      Instant occurredAt) {
    public ReservationCreatedEvent(Long reservationId,
                                   Long userId,
                                   Long spaceId,
                                   String status,
                                   String startAt,
                                   String endAt,
                                   List<Long> equipmentIds,
                                   Instant occurredAt) {
        this.reservationId = reservationId;
        this.userId = userId;
        this.spaceId = spaceId;
        this.status = status;
        this.startAt = startAt;
        this.endAt = endAt;
        this.equipmentIds = immutableCopyAllowingNulls(equipmentIds);
        this.occurredAt = occurredAt;
    }

    private static <T> List<T> immutableCopyAllowingNulls(List<T> source) {
        return source == null ? null : Collections.unmodifiableList(new ArrayList<>(source));
    }

    @Override
    public List<Long> equipmentIds() {
        return immutableCopyAllowingNulls(equipmentIds);
    }
}




