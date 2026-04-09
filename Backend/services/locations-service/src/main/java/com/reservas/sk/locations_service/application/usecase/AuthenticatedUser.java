package com.reservas.sk.locations_service.application.usecase;

import java.util.Set;

public record AuthenticatedUser(Long userId, String email, Set<String> roles) {
    public AuthenticatedUser(Long userId, String email) {
        this(userId, email, Set.of("USER"));
    }

    public AuthenticatedUser {
        roles = roles == null ? Set.of("USER") : Set.copyOf(roles);
    }
}






