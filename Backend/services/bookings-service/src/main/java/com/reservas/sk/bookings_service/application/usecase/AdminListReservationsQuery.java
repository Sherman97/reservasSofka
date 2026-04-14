package com.reservas.sk.bookings_service.application.usecase;

public record AdminListReservationsQuery(String fromExecutionDate,
                                         String toExecutionDate,
                                         String status,
                                         Long userId,
                                         Long siteId,
                                         Integer page,
                                         Integer size) {
}

