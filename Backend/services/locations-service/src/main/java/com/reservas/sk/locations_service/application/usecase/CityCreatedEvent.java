package com.reservas.sk.locations_service.application.usecase;

import java.time.Instant;

public record CityCreatedEvent(Long cityId, String name, String country, Instant occurredAt) {
}




