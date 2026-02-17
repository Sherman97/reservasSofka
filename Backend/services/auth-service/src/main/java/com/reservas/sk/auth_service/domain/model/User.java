package com.reservas.sk.auth_service.domain.model;

import java.time.LocalDateTime;

public class User {
    private final Long id;
    private final String name;
    private final String email;
    private final String passwordHash;
    private final LocalDateTime createdAt;

    public User(Long id, String name, String email, String passwordHash, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.createdAt = createdAt;
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
}





