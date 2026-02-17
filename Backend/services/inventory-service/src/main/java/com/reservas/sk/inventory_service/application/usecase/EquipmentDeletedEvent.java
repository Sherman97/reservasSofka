package com.reservas.sk.inventory_service.application.usecase;

import java.time.Instant;

public record EquipmentDeletedEvent(Long equipmentId,
                                    Long cityId,
                                    Instant occurredAt) {
}




