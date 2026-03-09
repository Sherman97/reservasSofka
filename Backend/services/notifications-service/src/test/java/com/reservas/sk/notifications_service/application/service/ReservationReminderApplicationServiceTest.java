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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

class ReservationReminderApplicationServiceTest {
    private static final String ASSERT_MSG = "PMD UnitTestAssertionsShouldIncludeMessage";
    private static final String KEY_RESERVATION_ID = "reservationId";
    private static final String EVENT_RESERVATION_CREATED = "bookings.reservation.created";
    private static final String KEY_USER_ID = "userId";
    private static final String KEY_SPACE_ID = "spaceId";
    private static final String KEY_END_AT = "endAt";

    private WebSocketBroadcastPort webSocketBroadcastPort;
    private ReservationReminderApplicationService service;

    @BeforeEach
    void setUp() {
        webSocketBroadcastPort = mock(WebSocketBroadcastPort.class);
        service = new ReservationReminderApplicationService(webSocketBroadcastPort);
    }

    @Test
    void handleEvent_ignoresNullOrUnsupportedEvents() {
        service.handleEvent(null, Map.of(KEY_RESERVATION_ID, 1L));
        service.handleEvent(EVENT_RESERVATION_CREATED, null);
        service.handleEvent(EVENT_RESERVATION_CREATED, Map.of());
        service.handleEvent("bookings.other", Map.of(KEY_RESERVATION_ID, 1L));

        verifyNoInteractions(webSocketBroadcastPort);
    }

    @Test
    void publishReminders_sends15mReminderAndAvoidsDuplicates() {
        Map<String, Object> payload = validPayload(Instant.now().plus(14, ChronoUnit.MINUTES));

        service.handleEvent(EVENT_RESERVATION_CREATED, payload);
        service.publishReminders();
        service.publishReminders();

        ArgumentCaptor<NotificationEvent> captor = ArgumentCaptor.forClass(NotificationEvent.class);
        verify(webSocketBroadcastPort, times(1)).publish(captor.capture());

        NotificationEvent published = captor.getValue();
        assertEquals("notifications.reservation.reminder.15m", published.routingKey(), ASSERT_MSG);
        assertEquals("notifications", published.channel(), ASSERT_MSG);
        assertEquals(15, published.payload().get("minutesLeft"), ASSERT_MSG);
    }

    @Test
    void publishReminders_sends5mAndOverdueWhenApplicable() {
        Map<String, Object> payload = validPayload(Instant.now().minus(11, ChronoUnit.MINUTES));

        service.handleEvent("bookings.reservation.delivered", payload);
        service.publishReminders();

        ArgumentCaptor<NotificationEvent> captor = ArgumentCaptor.forClass(NotificationEvent.class);
        verify(webSocketBroadcastPort, times(3)).publish(captor.capture());

        List<NotificationEvent> events = captor.getAllValues();
        assertEquals("notifications.reservation.reminder.15m", events.get(0).routingKey(), ASSERT_MSG);
        assertEquals("notifications.reservation.reminder.5m", events.get(1).routingKey(), ASSERT_MSG);
        assertEquals("notifications.reservation.reminder.overdue.10m", events.get(2).routingKey(), ASSERT_MSG);
    }

    @Test
    void cancelledEvent_removesReminderState() {
        Map<String, Object> payload = validPayload(Instant.now().plus(3, ChronoUnit.MINUTES));

        service.handleEvent(EVENT_RESERVATION_CREATED, payload);
        service.handleEvent("bookings.reservation.cancelled", Map.of(KEY_RESERVATION_ID, payload.get(KEY_RESERVATION_ID)));
        service.publishReminders();

        verifyNoInteractions(webSocketBroadcastPort);
    }

    @Test
    void returnedEvent_removesReminderState() {
        Map<String, Object> payload = validPayload(Instant.now().plus(3, ChronoUnit.MINUTES));

        service.handleEvent(EVENT_RESERVATION_CREATED, payload);
        service.handleEvent("bookings.reservation.returned", Map.of(KEY_RESERVATION_ID, payload.get(KEY_RESERVATION_ID)));
        service.publishReminders();

        verifyNoInteractions(webSocketBroadcastPort);
    }

    @Test
    void publishReminders_removesVeryOldReminders() {
        Map<String, Object> payload = validPayload(Instant.now().minus(2, ChronoUnit.DAYS));

        service.handleEvent(EVENT_RESERVATION_CREATED, payload);
        service.publishReminders();
        service.publishReminders();

        ArgumentCaptor<NotificationEvent> captor = ArgumentCaptor.forClass(NotificationEvent.class);
        verify(webSocketBroadcastPort, times(3)).publish(captor.capture());

        List<NotificationEvent> events = captor.getAllValues();
        assertTrue(events.stream().anyMatch(e -> "notifications.reservation.reminder.overdue.10m".equals(e.routingKey())), ASSERT_MSG);
    }

    @Test
    void handleEvent_acceptsStringNumericIds() {
        Map<String, Object> payload = new HashMap<>();
        payload.put(KEY_RESERVATION_ID, "404");
        payload.put(KEY_USER_ID, "505");
        payload.put(KEY_SPACE_ID, "606");
        payload.put(KEY_END_AT, Instant.now().plus(10, ChronoUnit.MINUTES).toString());

        service.handleEvent(EVENT_RESERVATION_CREATED, payload);
        service.publishReminders();

        ArgumentCaptor<NotificationEvent> captor = ArgumentCaptor.forClass(NotificationEvent.class);
        verify(webSocketBroadcastPort, times(1)).publish(captor.capture());

        List<NotificationEvent> events = captor.getAllValues();
        assertEquals("notifications.reservation.reminder.15m", events.get(0).routingKey(), ASSERT_MSG);
    }

    @Test
    void handleEvent_ignoresInvalidNumberAndDatePayloads() {
        Map<String, Object> invalidReservationId = new HashMap<>();
        invalidReservationId.put(KEY_RESERVATION_ID, "ABC");
        invalidReservationId.put(KEY_USER_ID, 202L);
        invalidReservationId.put(KEY_SPACE_ID, 303L);
        invalidReservationId.put(KEY_END_AT, Instant.now().toString());

        Map<String, Object> invalidEndAt = new HashMap<>();
        invalidEndAt.put(KEY_RESERVATION_ID, 101L);
        invalidEndAt.put(KEY_USER_ID, 202L);
        invalidEndAt.put(KEY_SPACE_ID, 303L);
        invalidEndAt.put(KEY_END_AT, "not-an-instant");

        service.handleEvent(EVENT_RESERVATION_CREATED, invalidReservationId);
        service.handleEvent(EVENT_RESERVATION_CREATED, invalidEndAt);
        service.publishReminders();

        verifyNoInteractions(webSocketBroadcastPort);
    }

    @Test
    void cancelledEvent_withInvalidReservationIdDoesNotRemoveExistingState() {
        Map<String, Object> payload = validPayload(Instant.now().plus(10, ChronoUnit.MINUTES));

        service.handleEvent(EVENT_RESERVATION_CREATED, payload);
        service.handleEvent("bookings.reservation.cancelled", Map.of(KEY_RESERVATION_ID, "invalid-id"));
        service.publishReminders();

        verify(webSocketBroadcastPort, times(1)).publish(any(NotificationEvent.class));
    }

    @Test
    void publishReminders_doesNothingBeforeThresholds() {
        Map<String, Object> payload = validPayload(Instant.now().plus(30, ChronoUnit.MINUTES));

        service.handleEvent(EVENT_RESERVATION_CREATED, payload);
        service.publishReminders();

        verify(webSocketBroadcastPort, never()).publish(any(NotificationEvent.class));
    }

    private Map<String, Object> validPayload(Instant endAt) {
        Map<String, Object> payload = new HashMap<>();
        payload.put(KEY_RESERVATION_ID, 101L);
        payload.put(KEY_USER_ID, 202L);
        payload.put(KEY_SPACE_ID, 303L);
        payload.put(KEY_END_AT, endAt.toString());
        return payload;
    }
}


