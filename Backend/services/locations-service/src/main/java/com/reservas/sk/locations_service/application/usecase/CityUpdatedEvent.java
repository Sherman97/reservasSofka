package com.reservas.sk.locations_service.application.usecase;

import java.time.Instant;

public record CityUpdatedEvent(Long cityId, String name, String country, Instant occurredAt) {
}




