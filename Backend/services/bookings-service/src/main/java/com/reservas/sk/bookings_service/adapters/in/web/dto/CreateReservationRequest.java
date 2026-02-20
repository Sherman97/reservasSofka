package com.reservas.sk.bookings_service.adapters.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.List;

// Human Check 🛡️: validaciones para rechazar requests invalidos antes de la logica de negocio.
public record CreateReservationRequest(@NotNull(message = "spaceId es obligatorio")
                                       @Positive(message = "spaceId es invalido")
                                       Long spaceId,
                                       @NotBlank(message = "startAt es obligatorio")
                                       String startAt,
                                       @NotBlank(message = "endAt es obligatorio")
                                       String endAt,
                                       String title,
                                       @Positive(message = "attendeesCount debe ser mayor que cero")
                                       Integer attendeesCount,
                                       String notes,
                                       List<Long> equipmentIds) {
}







