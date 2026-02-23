package com.reservas.sk.locations_service.application.usecase;

public record UpdateSpaceCommand(String name,
                                 Integer capacity,
                                 String floor,
                                 String description,
                                 String imageUrl,
                                 Boolean isActive) {
}





