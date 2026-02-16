package com.reservas.sk.inventory_service.adapters.out.messaging;

import com.reservas.sk.inventory_service.application.port.out.EquipmentEventPublisherPort;
import com.reservas.sk.inventory_service.application.usecase.EquipmentCreatedEvent;
import com.reservas.sk.inventory_service.application.usecase.EquipmentDeletedEvent;
import com.reservas.sk.inventory_service.application.usecase.EquipmentUpdatedEvent;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnMissingBean(EquipmentEventPublisherPort.class)
public class NoOpEquipmentEventPublisherAdapter implements EquipmentEventPublisherPort {
    @Override
    public void publishEquipmentCreated(EquipmentCreatedEvent event) {
        // RabbitMQ disabled.
    }

    @Override
    public void publishEquipmentUpdated(EquipmentUpdatedEvent event) {
        // RabbitMQ disabled.
    }

    @Override
    public void publishEquipmentDeleted(EquipmentDeletedEvent event) {
        // RabbitMQ disabled.
    }
}




