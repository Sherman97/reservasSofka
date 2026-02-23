package com.reservas.sk.locations_service.adapters.in.web.dto;

import jakarta.validation.constraints.NotBlank;

// Human Check 🛡️: validaciones minimas para impedir creacion de ciudad con datos vacios.
public record CreateCityRequest(@NotBlank(message = "name es obligatorio") String name,
                                @NotBlank(message = "country es obligatorio") String country) {
}






