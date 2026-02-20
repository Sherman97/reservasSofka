package com.reservas.sk.locations_service.application.usecase;

import java.time.Instant;

public record CityDeletedEvent(Long cityId, Instant occurredAt) {
}




