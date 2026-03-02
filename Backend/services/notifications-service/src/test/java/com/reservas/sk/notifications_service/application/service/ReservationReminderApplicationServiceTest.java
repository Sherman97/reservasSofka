package com.reservas.sk.notifications_service.application.service;

import com.reservas.sk.notifications_service.application.port.out.WebSocketBroadcastPort;
import com.reservas.sk.notifications_service.domain.model.NotificationEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

class ReservationReminderApplicationServiceTest {

    private WebSocketBroadcastPort webSocketBroadcastPort;
    private ReservationReminderApplicationService service;

    @BeforeEach
    void setUp() {
        webSocketBroadcastPort = mock(WebSocketBroadcastPort.class);
        service = new ReservationReminderApplicationService(webSocketBroadcastPort);
    }

    @Test
    void handleEvent_ignoresNullOrUnsupportedEvents() {
        service.handleEvent(null, Map.of("reservationId", 1L));
        service.handleEvent("bookings.reservation.created", null);
        service.handleEvent("bookings.reservation.created", Map.of());
        service.handleEvent("bookings.other", Map.of("reservationId", 1L));

        verifyNoInteractions(webSocketBroadcastPort);
    }

    @Test
    void publishReminders_sends15mReminderAndAvoidsDuplicates() {
        Map<String, Object> payload = validPayload(Instant.now().plus(14, ChronoUnit.MINUTES));

        service.handleEvent("bookings.reservation.created", payload);
        service.publishReminders();
        service.publishReminders();

        ArgumentCaptor<NotificationEvent> captor = ArgumentCaptor.forClass(NotificationEvent.class);
        verify(webSocketBroadcastPort, times(1)).publish(captor.capture());

        NotificationEvent published = captor.getValue();
        assertEquals("notifications.reservation.reminder.15m", published.routingKey());
        assertEquals("notifications", published.channel());
        assertEquals(15, published.payload().get("minutesLeft"));
    }

    @Test
    void publishReminders_sends5mAndOverdueWhenApplicable() {
        Map<String, Object> payload = validPayload(Instant.now().minus(11, ChronoUnit.MINUTES));

        service.handleEvent("bookings.reservation.delivered", payload);
        service.publishReminders();

        ArgumentCaptor<NotificationEvent> captor = ArgumentCaptor.forClass(NotificationEvent.class);
        verify(webSocketBroadcastPort, times(3)).publish(captor.capture());

        List<NotificationEvent> events = captor.getAllValues();
        assertEquals("notifications.reservation.reminder.15m", events.get(0).routingKey());
        assertEquals("notifications.reservation.reminder.5m", events.get(1).routingKey());
        assertEquals("notifications.reservation.reminder.overdue.10m", events.get(2).routingKey());
    }

    @Test
    void cancelledEvent_removesReminderState() {
        Map<String, Object> payload = validPayload(Instant.now().plus(3, ChronoUnit.MINUTES));

        service.handleEvent("bookings.reservation.created", payload);
        service.handleEvent("bookings.reservation.cancelled", Map.of("reservationId", payload.get("reservationId")));
        service.publishReminders();

        verifyNoInteractions(webSocketBroadcastPort);
    }

    @Test
    void returnedEvent_removesReminderState() {
        Map<String, Object> payload = validPayload(Instant.now().plus(3, ChronoUnit.MINUTES));

        service.handleEvent("bookings.reservation.created", payload);
        service.handleEvent("bookings.reservation.returned", Map.of("reservationId", payload.get("reservationId")));
        service.publishReminders();

        verifyNoInteractions(webSocketBroadcastPort);
    }

    @Test
    void publishReminders_removesVeryOldReminders() {
        Map<String, Object> payload = validPayload(Instant.now().minus(2, ChronoUnit.DAYS));

        service.handleEvent("bookings.reservation.created", payload);
        service.publishReminders();
        service.publishReminders();

        ArgumentCaptor<NotificationEvent> captor = ArgumentCaptor.forClass(NotificationEvent.class);
        verify(webSocketBroadcastPort, times(3)).publish(captor.capture());

        List<NotificationEvent> events = captor.getAllValues();
        assertTrue(events.stream().anyMatch(e -> "notifications.reservation.reminder.overdue.10m".equals(e.routingKey())));
    }

    private Map<String, Object> validPayload(Instant endAt) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("reservationId", 101L);
        payload.put("userId", 202L);
        payload.put("spaceId", 303L);
        payload.put("endAt", endAt.toString());
        return payload;
    }
}
