package com.reservas.sk.bookings_service.adapters.in.web.dto;

import java.util.List;

public record CreateReservationRequest(Long spaceId,
                                       String startAt,
                                       String endAt,
                                       String title,
                                       Integer attendeesCount,
                                       String notes,
                                       List<Long> equipmentIds) {
}






