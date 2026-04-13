package com.reservas.sk.bookings_service.application.usecase;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public record CreateReservationCommand(Long userId,
                                       Long spaceId,
                                       String startAt,
                                       String endAt,
                                       String title,
                                       Integer attendeesCount,
                                       String notes,
                                       List<Long> equipmentIds) {
    public CreateReservationCommand(Long userId,
                                    Long spaceId,
                                    String startAt,
                                    String endAt,
                                    String title,
                                    Integer attendeesCount,
                                    String notes,
                                    List<Long> equipmentIds) {
        this.userId = userId;
        this.spaceId = spaceId;
        this.startAt = startAt;
        this.endAt = endAt;
        this.title = title;
        this.attendeesCount = attendeesCount;
        this.notes = notes;
        this.equipmentIds = immutableCopyAllowingNulls(equipmentIds);
    }

    private static <T> List<T> immutableCopyAllowingNulls(List<T> source) {
        return source == null ? null : Collections.unmodifiableList(new ArrayList<>(source));
    }

    @Override
    public List<Long> equipmentIds() {
        return immutableCopyAllowingNulls(equipmentIds);
    }
}






