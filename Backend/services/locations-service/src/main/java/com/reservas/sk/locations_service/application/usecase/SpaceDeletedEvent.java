package com.reservas.sk.locations_service.application.usecase;

import java.time.Instant;

public record SpaceDeletedEvent(Long spaceId, Long cityId, Instant occurredAt) {
}




