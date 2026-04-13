package com.reservas.sk.bookings_service.adapters.in.web.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO for check-in reservation request.
 */
public record CheckInRequest(
    @NotBlank(message = "qrToken es obligatorio")
    String qrToken
) {
}
