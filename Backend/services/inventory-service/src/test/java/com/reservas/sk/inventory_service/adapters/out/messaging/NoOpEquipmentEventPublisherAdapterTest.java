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

        EquipmentCreatedEvent createdEvent = new EquipmentCreatedEvent(
                1L,
                2L,
                "Laptop",
                "available",
                Instant.now()
        );
        EquipmentUpdatedEvent updatedEvent = new EquipmentUpdatedEvent(
                1L,
                2L,
                "Laptop",
                "maintenance",
                Instant.now()
        );
        EquipmentDeletedEvent deletedEvent = new EquipmentDeletedEvent(1L, 2L, Instant.now());

        assertDoesNotThrow(() -> adapter.publishEquipmentCreated(createdEvent));
        assertDoesNotThrow(() -> adapter.publishEquipmentUpdated(updatedEvent));
        assertDoesNotThrow(() -> adapter.publishEquipmentDeleted(deletedEvent));
    }
}
