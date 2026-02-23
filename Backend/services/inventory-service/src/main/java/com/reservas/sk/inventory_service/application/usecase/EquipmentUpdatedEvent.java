package com.reservas.sk.inventory_service.application.usecase;

import java.time.Instant;

public record EquipmentUpdatedEvent(Long equipmentId,
                                    Long cityId,
                                    String name,
                                    String status,
                                    Instant occurredAt) {
}




