package com.reservas.sk.bookings_service.adapters.in.web.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record UpdateReservationRequest(
        @NotBlank(message = "El título es obligatorio")
        @Size(max = 100, message = "El título no puede exceder los 100 caracteres")
        String title,

        @NotNull(message = "La fecha/hora de inicio es obligatoria")
        @FutureOrPresent(message = "La fecha de inicio debe ser hoy o en el futuro")
        Instant startAt,

        @NotNull(message = "La fecha/hora de fin es obligatoria")
        @Future(message = "La fecha de fin debe ser en el futuro")
        Instant endAt,

        @NotNull(message = "La cantidad de asistentes es obligatoria")
        @Min(value = 1, message = "Debe haber al menos 1 asistente")
        Integer attendeesCount,

        @Size(max = 500, message = "Las notas no pueden exceder los 500 caracteres")
        String notes
) {
}
