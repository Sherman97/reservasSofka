package com.reservas.sk.notifications_service.application.port.in;

import java.util.Map;

public interface EventBroadcastUseCase {
    void broadcast(String routingKey, Map<String, Object> payload);
}






