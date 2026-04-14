package com.reservas.sk.auth_service.adapters.in.web.dto;

import java.time.LocalDateTime;
import java.util.Set;

public record UserResponse(Long id, String name, String email, LocalDateTime createdAt, Set<String> roles) {
    public UserResponse {
        roles = roles == null || roles.isEmpty() ? Set.of("USER") : Set.copyOf(roles);
    }
}





