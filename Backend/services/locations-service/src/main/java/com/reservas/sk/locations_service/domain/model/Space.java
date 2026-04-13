package com.reservas.sk.locations_service.domain.model;

import java.time.Instant;

public class Space {
    private final Long id;
    private final Long cityId;
    private final String name;
    private final Integer capacity;
    private final String floor;
    private final String description;
    private final String imageUrl;
    private final boolean active;
    private final Instant createdAt;
    private final Instant updatedAt;
    private final byte[] qrCode;
    private final String qrToken;
    private final String qrETag;

    public Space(Long id,
                 Long cityId,
                 String name,
                 Integer capacity,
                 String floor,
                 String description,
                 String imageUrl,
                 boolean active,
                 Instant createdAt,
                 Instant updatedAt,
                 byte[] qrCode,
                 String qrToken,
                 String qrETag) {
        this.id = id;
        this.cityId = cityId;
        this.name = name;
        this.capacity = capacity;
        this.floor = floor;
        this.description = description;
        this.imageUrl = imageUrl;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.qrCode = qrCode;
        this.qrToken = qrToken;
        this.qrETag = qrETag;
    }

    public Long getId() { return id; }
    public Long getCityId() { return cityId; }
    public String getName() { return name; }
    public Integer getCapacity() { return capacity; }
    public byte[] getQrCode() { return qrCode; }
    public String getQrToken() { return qrToken; }
    public String getQrETag() { return qrETag; }
    public String getFloor() { return floor; }
    public String getDescription() { return description; }
    public String getImageUrl() { return imageUrl; }
    public boolean isActive() { return active; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}





