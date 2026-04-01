package com.reservas.sk.bookings_service.domain.model;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

public class Reservation {
    // Status constants
    public static final String STATUS_PENDING = "pending";
    public static final String STATUS_CHECKED_IN = "checked_in";
    public static final String STATUS_NO_SHOW = "no_show";
    public static final String STATUS_CANCELED = "canceled";
    public static final String STATUS_COMPLETED = "completed";
    
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
    private final String qrToken;
    private final Instant checkedInAt;

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
                       List<ReservationEquipment> equipments,
                       String qrToken,
                       Instant checkedInAt) {
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
        this.equipments = equipments == null ? List.of() : List.copyOf(equipments);
        this.qrToken = qrToken;
        this.checkedInAt = checkedInAt;
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public Long getSpaceId() { return spaceId; }
    public Instant getStartDatetime() { return startDatetime; }
    public Instant getEndDatetime() { return endDatetime; }
    public String getStatus() { return status; }
    public String getTitle() { return title; }
    public Integer getAttendeesCount() { return attendeesCount; }
    public String getQrToken() { return qrToken; }
    public Instant getCheckedInAt() { return checkedInAt; }
    
    /**
     * Validates if this reservation can be checked in with a QR code.
     * Conditions:
     * 1. Status must be PENDING
     * 2. Current time must be within grace period after start time (5 minutes)
     * 
     * @param currentTime The current timestamp (UTC)
     * @param gracePeriodMinutes The grace period in minutes
     * @return true if check-in is allowed, false otherwise
     */
    public boolean canCheckIn(Instant currentTime, int gracePeriodMinutes) {
        if (!STATUS_PENDING.equals(this.status)) {
            return false;
        }
        
        // Check if current time is after start time but within grace period
        Instant graceDeadline = this.startDatetime.plus(gracePeriodMinutes, ChronoUnit.MINUTES);
        return !currentTime.isBefore(this.startDatetime) && !currentTime.isAfter(graceDeadline);
    }
    
    /**
     * Creates a new Reservation with checked-in status.
     * 
     * @param checkedInAt The timestamp when check-in occurred (UTC)
     * @return A new Reservation instance with updated status
     */
    public Reservation checkIn(Instant checkedInAt) {
        return new Reservation(
            this.id,
            this.userId,
            this.spaceId,
            this.startDatetime,
            this.endDatetime,
            STATUS_CHECKED_IN,
            this.title,
            this.attendeesCount,
            this.notes,
            this.cancellationReason,
            this.createdAt,
            this.equipments,
            this.qrToken,
            checkedInAt
        );
    }
    public String getNotes() { return notes; }
    public String getCancellationReason() { return cancellationReason; }
    public Instant getCreatedAt() { return createdAt; }
    public List<ReservationEquipment> getEquipments() { return List.copyOf(equipments); }
}






