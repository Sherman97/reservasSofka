package com.reservas.sk.notifications_service.application.service;

import com.reservas.sk.notifications_service.application.port.out.WebSocketBroadcastPort;
import com.reservas.sk.notifications_service.domain.model.NotificationEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class EventBroadcastApplicationServiceTest {
    private static final String ASSERT_MSG = "PMD UnitTestAssertionsShouldIncludeMessage";

    private WebSocketBroadcastPort webSocketBroadcastPort;
    private EventBroadcastApplicationService service;

    @BeforeEach
    void setUp() {
        webSocketBroadcastPort = mock(WebSocketBroadcastPort.class);
        service = new EventBroadcastApplicationService(webSocketBroadcastPort);
    }

    @Test
    void broadcast_mapsAuthChannel() {
        assertChannel("auth.login.success", "auth");
    }

    @Test
    void broadcast_mapsBookingsChannel() {
        assertChannel("bookings.reservation.created", "bookings");
    }

    @Test
    void broadcast_mapsInventoryChannel() {
        assertChannel("inventory.equipment.updated", "inventory");
    }

    @Test
    void broadcast_mapsLocationsChannel() {
        assertChannel("locations.city.created", "locations");
    }

    @Test
    void broadcast_usesFallbackChannelForNullRoutingKey() {
        assertChannel(null, "events");
    }

    @Test
    void broadcast_usesFallbackChannelForUnknownRoutingKey() {
        assertChannel("custom.event", "events");
    }

    private void assertChannel(String routingKey, String expectedChannel) {
        ArgumentCaptor<NotificationEvent> captor = ArgumentCaptor.forClass(NotificationEvent.class);
        Map<String, Object> payload = Map.of("id", 1L);

        service.broadcast(routingKey, payload);

        verify(webSocketBroadcastPort).publish(captor.capture());
        NotificationEvent event = captor.getValue();
        assertEquals(routingKey, event.routingKey(), ASSERT_MSG);
        assertEquals(expectedChannel, event.channel(), ASSERT_MSG);
        assertEquals(payload, event.payload(), ASSERT_MSG);
        assertNotNull(event.occurredAt(), ASSERT_MSG);
    }
}

