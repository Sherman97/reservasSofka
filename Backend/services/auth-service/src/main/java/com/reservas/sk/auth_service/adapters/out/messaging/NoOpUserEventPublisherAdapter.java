package com.reservas.sk.auth_service.adapters.out.messaging;

import com.reservas.sk.auth_service.application.port.out.UserEventPublisherPort;
import com.reservas.sk.auth_service.application.usecase.UserCreatedEvent;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnMissingBean(UserEventPublisherPort.class)
public class NoOpUserEventPublisherAdapter implements UserEventPublisherPort {
    @Override
    public void publishUserCreated(UserCreatedEvent event) {
        // RabbitMQ disabled.
    }
}





