package com.reservas.sk.inventory_service.adapters.in.web.dto;

public record CreateEquipmentRequest(Long cityId,
                                     String name,
                                     String serial,
                                     String barcode,
                                     String model,
                                     String status,
                                     String notes) {
}






