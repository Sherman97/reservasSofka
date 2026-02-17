package com.reservas.sk.notifications_service.adapters.out.websocket;

import com.reservas.sk.notifications_service.application.port.out.WebSocketBroadcastPort;
import com.reservas.sk.notifications_service.domain.model.NotificationEvent;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class StompWebSocketBroadcastAdapter implements WebSocketBroadcastPort {
    private final SimpMessagingTemplate messagingTemplate;

    public StompWebSocketBroadcastAdapter(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    public void publish(NotificationEvent event) {
        messagingTemplate.convertAndSend("/topic/events", event);
        messagingTemplate.convertAndSend("/topic/events." + event.channel(), event);
        messagingTemplate.convertAndSend("/topic/events." + event.routingKey(), event);
    }
}







