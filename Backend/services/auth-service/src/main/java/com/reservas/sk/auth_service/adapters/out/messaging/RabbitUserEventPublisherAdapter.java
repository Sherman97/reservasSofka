package com.reservas.sk.auth_service.adapters.out.messaging;

import com.reservas.sk.auth_service.application.port.out.UserEventPublisherPort;
import com.reservas.sk.auth_service.application.usecase.UserCreatedEvent;
import com.reservas.sk.auth_service.infrastructure.config.RabbitProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "app.rabbit", name = "enabled", havingValue = "true")
public class RabbitUserEventPublisherAdapter implements UserEventPublisherPort {
    private static final Logger log = LoggerFactory.getLogger(RabbitUserEventPublisherAdapter.class);

    private final RabbitTemplate rabbitTemplate;
    private final RabbitProperties rabbitProperties;

    public RabbitUserEventPublisherAdapter(RabbitTemplate rabbitTemplate, RabbitProperties rabbitProperties) {
        this.rabbitTemplate = rabbitTemplate;
        this.rabbitProperties = rabbitProperties;
    }

    @Override
    public void publishUserCreated(UserCreatedEvent event) {
        try {
            rabbitTemplate.convertAndSend(
                    rabbitProperties.getExchange(),
                    rabbitProperties.getUserCreatedRoutingKey(),
                    event
            );
        } catch (Exception ex) {
            log.error("Failed to publish user.created event for userId={}: {}", event.userId(), ex.getMessage(), ex);
        }
    }
}





