package com.reservas.sk.auth_service.adapters.out.messaging;

import com.reservas.sk.auth_service.application.port.out.UserEventPublisherPort;
import com.reservas.sk.auth_service.application.usecase.UserCreatedEvent;
import com.reservas.sk.auth_service.infrastructure.config.RabbitProperties;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "app.rabbit", name = "enabled", havingValue = "true")
public class RabbitUserEventPublisherAdapter implements UserEventPublisherPort {
    private final RabbitTemplate rabbitTemplate;
    private final RabbitProperties rabbitProperties;

    public RabbitUserEventPublisherAdapter(RabbitTemplate rabbitTemplate, RabbitProperties rabbitProperties) {
        this.rabbitTemplate = rabbitTemplate;
        this.rabbitProperties = rabbitProperties;
    }

    @Override
    public void publishUserCreated(UserCreatedEvent event) {
        rabbitTemplate.convertAndSend(
                rabbitProperties.getExchange(),
                rabbitProperties.getUserCreatedRoutingKey(),
                event
        );
    }
}





