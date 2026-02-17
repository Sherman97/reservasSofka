package com.reservas.sk.auth_service.application.port.out;

import com.reservas.sk.auth_service.application.usecase.UserCreatedEvent;

public interface UserEventPublisherPort {
    void publishUserCreated(UserCreatedEvent event);
}





