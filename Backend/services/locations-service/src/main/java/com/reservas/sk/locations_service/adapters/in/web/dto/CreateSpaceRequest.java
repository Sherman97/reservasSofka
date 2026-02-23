package com.reservas.sk.locations_service.adapters.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

// Human Check 🛡️: validaciones para evitar espacios sin ciudad/nombre o con capacidad de 0.
public record CreateSpaceRequest(@NotNull(message = "cityId es obligatorio")
                                 @Positive(message = "cityId es invalido")
                                 Long cityId,
                                 @NotBlank(message = "name es obligatorio")
                                 String name,
                                 @Positive(message = "capacity debe ser mayor que cero")
                                 Integer capacity,
                                 String floor,
                                 String description,
                                 String imageUrl,
                                 Boolean isActive) {
}





