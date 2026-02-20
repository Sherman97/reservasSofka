package com.reservas.sk.bookings_service.domain.model;

import java.time.Instant;

public class ReservationEquipment {
    private final Long id;
    private final Long reservationId;
    private final Long equipmentId;
    private final String status;
    private final Instant deliveredAt;
    private final Long deliveredBy;
    private final Instant returnedAt;
    private final Long returnedBy;
    private final String conditionNotes;

    public ReservationEquipment(Long id,
                                Long reservationId,
                                Long equipmentId,
                                String status,
                                Instant deliveredAt,
                                Long deliveredBy,
                                Instant returnedAt,
                                Long returnedBy,
                                String conditionNotes) {
        this.id = id;
        this.reservationId = reservationId;
        this.equipmentId = equipmentId;
        this.status = status;
        this.deliveredAt = deliveredAt;
        this.deliveredBy = deliveredBy;
        this.returnedAt = returnedAt;
        this.returnedBy = returnedBy;
        this.conditionNotes = conditionNotes;
    }

    public Long getId() { return id; }
    public Long getReservationId() { return reservationId; }
    public Long getEquipmentId() { return equipmentId; }
    public String getStatus() { return status; }
    public Instant getDeliveredAt() { return deliveredAt; }
    public Long getDeliveredBy() { return deliveredBy; }
    public Instant getReturnedAt() { return returnedAt; }
    public Long getReturnedBy() { return returnedBy; }
    public String getConditionNotes() { return conditionNotes; }
}






