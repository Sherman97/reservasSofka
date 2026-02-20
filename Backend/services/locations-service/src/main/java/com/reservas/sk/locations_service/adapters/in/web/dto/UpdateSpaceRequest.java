package com.reservas.sk.locations_service.adapters.in.web.dto;

import jakarta.validation.constraints.Positive;

// Human Check 🛡️: capacity en update debe ser mayor a 0 cuando se actualiza.
public record UpdateSpaceRequest(String name,
                                 @Positive(message = "capacity debe ser mayor que cero")
                                 Integer capacity,
                                 String floor,
                                 String description,
                                 String imageUrl,
                                 Boolean isActive) {
}





