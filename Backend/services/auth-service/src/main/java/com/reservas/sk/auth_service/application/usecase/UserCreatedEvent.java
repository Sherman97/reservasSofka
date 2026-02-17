package com.reservas.sk.auth_service.application.usecase;

import java.time.Instant;

public record UserCreatedEvent(Long userId, String email, String name, Instant occurredAt) {
}





