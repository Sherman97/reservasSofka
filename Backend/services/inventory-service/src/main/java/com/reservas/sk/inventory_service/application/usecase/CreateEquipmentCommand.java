package com.reservas.sk.inventory_service.application.usecase;

public record CreateEquipmentCommand(Long cityId,
                                     String name,
                                     String serial,
                                     String barcode,
                                     String model,
                                     String status,
                                     String notes,
                                     String imageUrl) {
}





