package com.reservas.sk.bookings_service.adapters.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.ArrayList;
import java.util.Collections;
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
    public CreateReservationRequest(Long spaceId,
                                    String startAt,
                                    String endAt,
                                    String title,
                                    Integer attendeesCount,
                                    String notes,
                                    List<Long> equipmentIds) {
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







