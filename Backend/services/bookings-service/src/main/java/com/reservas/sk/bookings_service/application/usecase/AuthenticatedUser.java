package com.reservas.sk.bookings_service.application.usecase;

import java.util.Set;

public record AuthenticatedUser(Long userId, String email, Set<String> roles) {
    public AuthenticatedUser(Long userId, String email) {
        this(userId, email, Set.of("USER"));
    }

    public AuthenticatedUser {
        roles = roles == null ? Set.of("USER") : Set.copyOf(roles);
    }

    public boolean hasRole(String roleName) {
        if (roleName == null || roleName.isBlank()) {
            return false;
        }
        return roles.contains(roleName.trim().toUpperCase());
    }
}







