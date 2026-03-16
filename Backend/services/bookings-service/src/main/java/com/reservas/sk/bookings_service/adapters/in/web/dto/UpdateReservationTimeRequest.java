package com.reservas.sk.bookings_service.adapters.in.web.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateReservationTimeRequest(@NotBlank(message = "startAt es obligatorio")
                                           String startAt,
                                           @NotBlank(message = "endAt es obligatorio")
                                           String endAt) {
}

