package com.reservas.sk.inventory_service.adapters.out.messaging;

import com.reservas.sk.inventory_service.application.usecase.EquipmentCreatedEvent;
import com.reservas.sk.inventory_service.application.usecase.EquipmentDeletedEvent;
import com.reservas.sk.inventory_service.application.usecase.EquipmentUpdatedEvent;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

class NoOpEquipmentEventPublisherAdapterTest {

    @Test
    void noOpMethodsDoNotThrow() {
        NoOpEquipmentEventPublisherAdapter adapter = new NoOpEquipmentEventPublisherAdapter();

        assertDoesNotThrow(() -> adapter.publishEquipmentCreated(new EquipmentCreatedEvent(1L, 2L, "Laptop", "available", Instant.now())));
        assertDoesNotThrow(() -> adapter.publishEquipmentUpdated(new EquipmentUpdatedEvent(1L, 2L, "Laptop", "maintenance", Instant.now())));
        assertDoesNotThrow(() -> adapter.publishEquipmentDeleted(new EquipmentDeletedEvent(1L, 2L, Instant.now())));
    }
}
