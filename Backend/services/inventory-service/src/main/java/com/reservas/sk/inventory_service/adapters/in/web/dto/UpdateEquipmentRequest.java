package com.reservas.sk.inventory_service.adapters.in.web.dto;

public record UpdateEquipmentRequest(String name,
                                     String serial,
                                     String barcode,
                                     String model,
                                     String status,
                                     String notes) {
}






