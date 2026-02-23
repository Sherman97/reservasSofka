package com.reservas.sk.locations_service.application.usecase;

import java.time.Instant;

public record SpaceCreatedEvent(Long spaceId, Long cityId, String name, boolean active, Instant occurredAt) {
}




