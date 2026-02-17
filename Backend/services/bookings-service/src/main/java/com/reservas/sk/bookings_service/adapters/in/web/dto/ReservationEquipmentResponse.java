package com.reservas.sk.bookings_service.adapters.in.web.dto;

public record ReservationEquipmentResponse(Long id,
                                           Long equipmentId,
                                           String status,
                                           String deliveredAt,
                                           Long deliveredBy,
                                           String returnedAt,
                                           Long returnedBy,
                                           String conditionNotes) {
}






