package com.reservas.sk.locations_service.adapters.in.web.dto;

public record SpaceResponse(Long id,
                            Long cityId,
                            String name,
                            Integer capacity,
                            String floor,
                            String description,
                            boolean isActive,
                            String createdAt,
                            String updatedAt) {
}






