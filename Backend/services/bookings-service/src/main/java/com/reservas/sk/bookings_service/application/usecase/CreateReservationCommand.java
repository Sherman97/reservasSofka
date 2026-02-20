package com.reservas.sk.bookings_service.application.usecase;

import java.util.List;

public record CreateReservationCommand(Long userId,
                                       Long spaceId,
                                       String startAt,
                                       String endAt,
                                       String title,
                                       Integer attendeesCount,
                                       String notes,
                                       List<Long> equipmentIds) {
}






