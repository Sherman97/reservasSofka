package com.reservas.sk.locations_service.application.usecase;

public record CreateSpaceCommand(Long cityId,
                                 String name,
                                 Integer capacity,
                                 String floor,
                                 String description,
                                 String imageUrl,
                                 Boolean isActive) {
}





