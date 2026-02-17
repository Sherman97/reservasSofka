package com.reservas.sk.auth_service.adapters.in.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "name es obligatorio")
        String name,
        @NotBlank(message = "email es obligatorio")
        @Email(message = "email no es valido")
        String email,
        @NotBlank(message = "password es obligatorio")
        @Size(min = 6, message = "password debe tener minimo 6 caracteres")
        String password
) {
}





