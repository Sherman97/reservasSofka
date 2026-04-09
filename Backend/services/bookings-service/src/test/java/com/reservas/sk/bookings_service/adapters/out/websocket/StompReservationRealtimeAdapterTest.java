package com.reservas.sk.bookings_service.adapters.out.websocket;

import com.reservas.sk.bookings_service.application.usecase.ReservationCancelledEvent;
import com.reservas.sk.bookings_service.application.usecase.ReservationCreatedEvent;
import org.junit.jupiter.api.Test;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class StompReservationRealtimeAdapterTest {

    @Test
    void publishReservationCreatedSendsGeneralAndSpecificTopics() {
        SimpMessagingTemplate messagingTemplate = mock(SimpMessagingTemplate.class);
        StompReservationRealtimeAdapter adapter = new StompReservationRealtimeAdapter(messagingTemplate);
        ReservationCreatedEvent event = new ReservationCreatedEvent(
                10L,
                20L,
                30L,
                "CONFIRMED",
                "2026-04-08T10:00:00Z",
                "2026-04-08T11:00:00Z",
                List.of(1L, 2L),
                Instant.parse("2026-04-08T09:00:00Z")
        );

        Map<String, Object> expectedPayload = Map.of("type", "reservation.created", "data", event);

        adapter.publishReservationCreated(event);

        verify(messagingTemplate).convertAndSend(eq("/topic/bookings.reservations"), eq(expectedPayload));
        verify(messagingTemplate).convertAndSend(eq("/topic/bookings.reservations.created"), eq(expectedPayload));
    }

    @Test
    void publishReservationCancelledSendsGeneralAndSpecificTopics() {
        SimpMessagingTemplate messagingTemplate = mock(SimpMessagingTemplate.class);
        StompReservationRealtimeAdapter adapter = new StompReservationRealtimeAdapter(messagingTemplate);
        ReservationCancelledEvent event = new ReservationCancelledEvent(
                11L,
                21L,
                31L,
                "CANCELLED",
                "Conflicto",
                Instant.parse("2026-04-08T09:00:00Z")
        );

        Map<String, Object> expectedPayload = Map.of("type", "reservation.cancelled", "data", event);

        adapter.publishReservationCancelled(event);

        verify(messagingTemplate).convertAndSend(eq("/topic/bookings.reservations"), eq(expectedPayload));
        verify(messagingTemplate).convertAndSend(eq("/topic/bookings.reservations.cancelled"), eq(expectedPayload));
    }
}
