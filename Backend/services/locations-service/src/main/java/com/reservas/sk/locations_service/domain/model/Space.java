package com.reservas.sk.locations_service.domain.model;

import java.time.Instant;

public class Space {
    private final Long id;
    private final Long cityId;
    private final String name;
    private final Integer capacity;
    private final String floor;
    private final String description;
    private final boolean active;
    private final Instant createdAt;
    private final Instant updatedAt;

    public Space(Long id,
                 Long cityId,
                 String name,
                 Integer capacity,
                 String floor,
                 String description,
                 boolean active,
                 Instant createdAt,
                 Instant updatedAt) {
        this.id = id;
        this.cityId = cityId;
        this.name = name;
        this.capacity = capacity;
        this.floor = floor;
        this.description = description;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public Long getCityId() { return cityId; }
    public String getName() { return name; }
    public Integer getCapacity() { return capacity; }
    public String getFloor() { return floor; }
    public String getDescription() { return description; }
    public boolean isActive() { return active; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}






