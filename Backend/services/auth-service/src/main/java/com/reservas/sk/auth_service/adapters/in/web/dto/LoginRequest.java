package com.reservas.sk.auth_service.adapters.in.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "email es obligatorio")
        @Email(message = "email no es valido")
        String email,
        @NotBlank(message = "password es obligatorio")
        String password
) {
}





