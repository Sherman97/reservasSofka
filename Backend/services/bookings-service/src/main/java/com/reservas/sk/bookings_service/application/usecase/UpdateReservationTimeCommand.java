package com.reservas.sk.bookings_service.application.usecase;

public record UpdateReservationTimeCommand(Long reservationId,
                                           String startAt,
                                           String endAt) {
}

