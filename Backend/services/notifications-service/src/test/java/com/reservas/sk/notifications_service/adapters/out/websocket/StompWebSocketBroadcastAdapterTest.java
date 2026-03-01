package com.reservas.sk.notifications_service.adapters.out.websocket;

import com.reservas.sk.notifications_service.domain.model.NotificationEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.Instant;
import java.util.Map;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class StompWebSocketBroadcastAdapterTest {
    private SimpMessagingTemplate messagingTemplate;
    private StompWebSocketBroadcastAdapter adapter;

    @BeforeEach
    void setUp() {
        messagingTemplate = mock(SimpMessagingTemplate.class);
        adapter = new StompWebSocketBroadcastAdapter(messagingTemplate);
    }

    @Test
    void publishSendsToCorrectTopics() {
        NotificationEvent event = new NotificationEvent(
            "clave",
            "canal",
            Map.of("msg", "payload"),
            Instant.now()
        );
        adapter.publish(event);
        verify(messagingTemplate).convertAndSend("/topic/events", event);
        verify(messagingTemplate).convertAndSend("/topic/events.canal", event);
        verify(messagingTemplate).convertAndSend("/topic/events.clave", event);
    }
}
