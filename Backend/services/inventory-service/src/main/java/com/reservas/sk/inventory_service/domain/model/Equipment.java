package com.reservas.sk.inventory_service.domain.model;

import java.time.Instant;

public class Equipment {
    private final Long id;
    private final Long cityId;
    private final String name;
    private final String serial;
    private final String barcode;
    private final String model;
    private final String status;
    private final String notes;
    private final String imageUrl;
    private final Instant createdAt;
    private final Instant updatedAt;

    public Equipment(Long id,
                     Long cityId,
                     String name,
                     String serial,
                     String barcode,
                     String model,
                     String status,
                     String notes,
                     String imageUrl,
                     Instant createdAt,
                     Instant updatedAt) {
        this.id = id;
        this.cityId = cityId;
        this.name = name;
        this.serial = serial;
        this.barcode = barcode;
        this.model = model;
        this.status = status;
        this.notes = notes;
        this.imageUrl = imageUrl;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public Long getCityId() { return cityId; }
    public String getName() { return name; }
    public String getSerial() { return serial; }
    public String getBarcode() { return barcode; }
    public String getModel() { return model; }
    public String getStatus() { return status; }
    public String getNotes() { return notes; }
    public String getImageUrl() { return imageUrl; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}





