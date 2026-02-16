package com.reservas.sk.locations_service.adapters.in.web.dto;

public record CreateSpaceRequest(Long cityId,
                                 String name,
                                 Integer capacity,
                                 String floor,
                                 String description,
                                 Boolean isActive) {
}






