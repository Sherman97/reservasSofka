package com.reservas.sk.inventory_service.adapters.out.messaging;

import com.reservas.sk.inventory_service.application.port.out.EquipmentEventPublisherPort;
import com.reservas.sk.inventory_service.application.usecase.EquipmentCreatedEvent;
import com.reservas.sk.inventory_service.application.usecase.EquipmentDeletedEvent;
import com.reservas.sk.inventory_service.application.usecase.EquipmentUpdatedEvent;
import com.reservas.sk.inventory_service.infrastructure.config.RabbitProperties;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "app.rabbit", name = "enabled", havingValue = "true")
public class RabbitEquipmentEventPublisherAdapter implements EquipmentEventPublisherPort {
    private final RabbitTemplate rabbitTemplate;
    private final RabbitProperties rabbitProperties;

    public RabbitEquipmentEventPublisherAdapter(RabbitTemplate rabbitTemplate, RabbitProperties rabbitProperties) {
        this.rabbitTemplate = rabbitTemplate;
        this.rabbitProperties = rabbitProperties;
    }

    @Override
    public void publishEquipmentCreated(EquipmentCreatedEvent event) {
        rabbitTemplate.convertAndSend(
                rabbitProperties.getExchange(),
                rabbitProperties.getEquipmentCreatedRoutingKey(),
                event
        );
    }

    @Override
    public void publishEquipmentUpdated(EquipmentUpdatedEvent event) {
        rabbitTemplate.convertAndSend(
                rabbitProperties.getExchange(),
                rabbitProperties.getEquipmentUpdatedRoutingKey(),
                event
        );
    }

    @Override
    public void publishEquipmentDeleted(EquipmentDeletedEvent event) {
        rabbitTemplate.convertAndSend(
                rabbitProperties.getExchange(),
                rabbitProperties.getEquipmentDeletedRoutingKey(),
                event
        );
    }
}




