package com.reservas.sk.notifications_service.application.service;

import com.reservas.sk.notifications_service.application.port.in.EventBroadcastUseCase;
import com.reservas.sk.notifications_service.application.port.out.WebSocketBroadcastPort;
import com.reservas.sk.notifications_service.domain.model.NotificationEvent;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;

@Service
public class EventBroadcastApplicationService implements EventBroadcastUseCase {
    private final WebSocketBroadcastPort webSocketBroadcastPort;

    public EventBroadcastApplicationService(WebSocketBroadcastPort webSocketBroadcastPort) {
        this.webSocketBroadcastPort = webSocketBroadcastPort;
    }

    @Override
    public void broadcast(String routingKey, Map<String, Object> payload) {
        String channel = toChannel(routingKey);
        NotificationEvent event = new NotificationEvent(routingKey, channel, payload, Instant.now());
        webSocketBroadcastPort.publish(event);
    }

    private String toChannel(String routingKey) {
        if (routingKey == null || routingKey.isBlank()) {
            return "events";
        }

        if (routingKey.startsWith("auth.")) {
            return "auth";
        }
        if (routingKey.startsWith("bookings.")) {
            return "bookings";
        }
        if (routingKey.startsWith("inventory.")) {
            return "inventory";
        }
        if (routingKey.startsWith("locations.")) {
            return "locations";
        }
        return "events";
    }
}






