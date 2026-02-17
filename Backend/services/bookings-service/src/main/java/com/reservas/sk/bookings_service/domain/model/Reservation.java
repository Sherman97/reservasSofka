package com.reservas.sk.bookings_service.domain.model;

import java.time.Instant;
import java.util.List;

public class Reservation {
    private final Long id;
    private final Long userId;
    private final Long spaceId;
    private final Instant startDatetime;
    private final Instant endDatetime;
    private final String status;
    private final String title;
    private final Integer attendeesCount;
    private final String notes;
    private final String cancellationReason;
    private final Instant createdAt;
    private final List<ReservationEquipment> equipments;

    public Reservation(Long id,
                       Long userId,
                       Long spaceId,
                       Instant startDatetime,
                       Instant endDatetime,
                       String status,
                       String title,
                       Integer attendeesCount,
                       String notes,
                       String cancellationReason,
                       Instant createdAt,
                       List<ReservationEquipment> equipments) {
        this.id = id;
        this.userId = userId;
        this.spaceId = spaceId;
        this.startDatetime = startDatetime;
        this.endDatetime = endDatetime;
        this.status = status;
        this.title = title;
        this.attendeesCount = attendeesCount;
        this.notes = notes;
        this.cancellationReason = cancellationReason;
        this.createdAt = createdAt;
        this.equipments = equipments;
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public Long getSpaceId() { return spaceId; }
    public Instant getStartDatetime() { return startDatetime; }
    public Instant getEndDatetime() { return endDatetime; }
    public String getStatus() { return status; }
    public String getTitle() { return title; }
    public Integer getAttendeesCount() { return attendeesCount; }
    public String getNotes() { return notes; }
    public String getCancellationReason() { return cancellationReason; }
    public Instant getCreatedAt() { return createdAt; }
    public List<ReservationEquipment> getEquipments() { return equipments; }
}






