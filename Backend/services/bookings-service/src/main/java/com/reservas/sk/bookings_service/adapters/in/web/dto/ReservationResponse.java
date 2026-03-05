package com.reservas.sk.bookings_service.adapters.in.web.dto;

import java.util.List;

public record ReservationResponse(Long id,
                                  Long userId,
                                  Long spaceId,
                                  String startAt,
                                  String endAt,
                                  String status,
                                  String title,
                                  Integer attendeesCount,
                                  String notes,
                                  String cancellationReason,
                                  String createdAt,
                                  List<ReservationEquipmentResponse> equipments) {
    public ReservationResponse(Long id,
                               Long userId,
                               Long spaceId,
                               String startAt,
                               String endAt,
                               String status,
                               String title,
                               Integer attendeesCount,
                               String notes,
                               String cancellationReason,
                               String createdAt,
                               List<ReservationEquipmentResponse> equipments) {
        this.id = id;
        this.userId = userId;
        this.spaceId = spaceId;
        this.startAt = startAt;
        this.endAt = endAt;
        this.status = status;
        this.title = title;
        this.attendeesCount = attendeesCount;
        this.notes = notes;
        this.cancellationReason = cancellationReason;
        this.createdAt = createdAt;
        this.equipments = equipments == null ? List.of() : List.copyOf(equipments);
    }
}






