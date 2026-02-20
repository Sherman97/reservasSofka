package com.reservas.sk.inventory_service.adapters.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

// Human Check 🛡️: validaciones para bloquear payloads invalidos antes del servicio.
public record CreateEquipmentRequest(@NotNull(message = "cityId es obligatorio")
                                     @Positive(message = "cityId es invalido")
                                     Long cityId,
                                     @NotBlank(message = "name es obligatorio")
                                     String name,
                                     String serial,
                                     String barcode,
                                     String model,
                                     @Pattern(
                                             regexp = "^(available|maintenance|retired)$",
                                             message = "status invalido. Use: available, maintenance, retired"
                                     )
                                     String status,
                                     String notes,
                                     String imageUrl) {
}





