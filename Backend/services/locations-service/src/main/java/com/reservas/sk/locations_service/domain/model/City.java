package com.reservas.sk.locations_service.domain.model;

import java.time.Instant;

public class City {
    private final Long id;
    private final String name;
    private final String country;
    private final Instant createdAt;
    private final Instant updatedAt;

    public City(Long id, String name, String country, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.name = name;
        this.country = country;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getCountry() { return country; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}






