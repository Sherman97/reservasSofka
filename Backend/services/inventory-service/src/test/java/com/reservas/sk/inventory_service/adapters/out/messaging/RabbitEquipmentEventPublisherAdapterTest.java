package com.reservas.sk.inventory_service.adapters.out.messaging;

import com.reservas.sk.inventory_service.application.usecase.EquipmentCreatedEvent;
import com.reservas.sk.inventory_service.application.usecase.EquipmentDeletedEvent;
import com.reservas.sk.inventory_service.application.usecase.EquipmentUpdatedEvent;
import com.reservas.sk.inventory_service.infrastructure.config.RabbitProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.time.Instant;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class RabbitEquipmentEventPublisherAdapterTest {

    private RabbitTemplate rabbitTemplate;
    private RabbitEquipmentEventPublisherAdapter adapter;

    @BeforeEach
    void setUp() {
        rabbitTemplate = mock(RabbitTemplate.class);

        RabbitProperties properties = new RabbitProperties();
        properties.setExchange("reservas.events");
        properties.setEquipmentCreatedRoutingKey("inventory.equipment.created");
        properties.setEquipmentUpdatedRoutingKey("inventory.equipment.updated");
        properties.setEquipmentDeletedRoutingKey("inventory.equipment.deleted");

        adapter = new RabbitEquipmentEventPublisherAdapter(rabbitTemplate, properties);
    }

    @Test
    void publishesAllEquipmentEventsWithConfiguredRoutingKeys() {
        EquipmentCreatedEvent created = new EquipmentCreatedEvent(1L, 2L, "Laptop", "available", Instant.now());
        EquipmentUpdatedEvent updated = new EquipmentUpdatedEvent(1L, 2L, "Laptop", "maintenance", Instant.now());
        EquipmentDeletedEvent deleted = new EquipmentDeletedEvent(1L, 2L, Instant.now());

        adapter.publishEquipmentCreated(created);
        adapter.publishEquipmentUpdated(updated);
        adapter.publishEquipmentDeleted(deleted);

        verify(rabbitTemplate).convertAndSend("reservas.events", "inventory.equipment.created", created);
        verify(rabbitTemplate).convertAndSend("reservas.events", "inventory.equipment.updated", updated);
        verify(rabbitTemplate).convertAndSend("reservas.events", "inventory.equipment.deleted", deleted);
    }
}
