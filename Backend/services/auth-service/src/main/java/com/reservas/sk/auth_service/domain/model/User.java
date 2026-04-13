package com.reservas.sk.auth_service.domain.model;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

public class User {
    private final Long id;
    private final String name;
    private final String email;
    private final String passwordHash;
    private final LocalDateTime createdAt;
    private final Set<String> roles;

    public User(Long id, String name, String email, String passwordHash, LocalDateTime createdAt) {
        this(id, name, email, passwordHash, createdAt, Set.of("USER"));
    }

    public User(Long id,
                String name,
                String email,
                String passwordHash,
                LocalDateTime createdAt,
                Set<String> roles) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.createdAt = createdAt;
        this.roles = immutableRoles(roles);
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Set<String> getRoles() {
        return roles;
    }

    private Set<String> immutableRoles(Set<String> source) {
        if (source == null || source.isEmpty()) {
            return Set.of("USER");
        }
        Set<String> normalized = new HashSet<>();
        for (String role : source) {
            if (role != null && !role.isBlank()) {
                normalized.add(role.trim().toUpperCase());
            }
        }
        if (normalized.isEmpty()) {
            return Set.of("USER");
        }
        return Collections.unmodifiableSet(normalized);
    }
}





