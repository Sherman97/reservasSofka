package com.reservas.sk.inventory_service.adapters.in.web.dto;

import jakarta.validation.constraints.Pattern;

// Human Check 🛡️: se valida status cuando viene informado para evitar valores fuera de logica.
public record UpdateEquipmentRequest(String name,
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





