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
}






