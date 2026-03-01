package com.reservas.sk.bookings_service.application.usecase;

public record HandoverReservationCommand(Long reservationId,
                                         Long staffId,
                                         String novelty) {
}

