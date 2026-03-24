package com.reservas.sk.auth_service.adapters.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "name es obligatorio")
        String name,
        @NotBlank(message = "email es obligatorio")
        @Pattern(
                regexp = "(?i)^[a-z0-9._%+-]+@sofka\\.com\\.co$",
                message = "El correo corporativo no cumple con el formato válido"
        )
        String email,
        @NotBlank(message = "password es obligatorio")
        @Size(min = 6, message = "password debe tener minimo 6 caracteres")
        String password
) {
}




