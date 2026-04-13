package com.reservas.sk.bookings_service.adapters.out.messaging;

import com.reservas.sk.bookings_service.application.usecase.ReservationCancelledEvent;
import com.reservas.sk.bookings_service.application.usecase.ReservationCreatedEvent;
import com.reservas.sk.bookings_service.application.usecase.ReservationDeliveredEvent;
import com.reservas.sk.bookings_service.application.usecase.ReservationReturnedEvent;
import com.reservas.sk.bookings_service.infrastructure.config.RabbitProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.time.Instant;
import java.util.List;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class RabbitReservationEventPublisherAdapterTest {
    private static final String EXCHANGE = "reservas.events";

    private RabbitTemplate rabbitTemplate;
    private RabbitReservationEventPublisherAdapter adapter;

    @BeforeEach
    void setUp() {
        rabbitTemplate = mock(RabbitTemplate.class);

        RabbitProperties properties = new RabbitProperties();
        properties.setExchange(EXCHANGE);
        properties.setReservationCreatedRoutingKey("bookings.reservation.created");
        properties.setReservationCancelledRoutingKey("bookings.reservation.cancelled");
        properties.setReservationDeliveredRoutingKey("bookings.reservation.delivered");
        properties.setReservationReturnedRoutingKey("bookings.reservation.returned");

        adapter = new RabbitReservationEventPublisherAdapter(rabbitTemplate, properties);
    }

    @Test
    void publishesAllReservationEventsWithConfiguredRoutingKeys() {
        ReservationCreatedEvent created = new ReservationCreatedEvent(
                1L,
                2L,
                3L,
                "confirmed",
                "2026-03-01T10:00:00Z",
                "2026-03-01T11:00:00Z",
                List.of(9L),
                Instant.now()
        );
        ReservationCancelledEvent cancelled = new ReservationCancelledEvent(
                1L,
                2L,
                3L,
                "cancelled",
                "motivo",
                Instant.now()
        );
        ReservationDeliveredEvent delivered = new ReservationDeliveredEvent(
                1L,
                2L,
                3L,
                77L,
                "in_progress",
                "ok",
                "2026-03-01T11:00:00Z",
                Instant.now()
        );
        ReservationReturnedEvent returned = new ReservationReturnedEvent(
                1L,
                2L,
                3L,
                77L,
                "completed",
                "ok",
                "2026-03-01T11:00:00Z",
                Instant.now()
        );

        adapter.publishReservationCreated(created);
        adapter.publishReservationCancelled(cancelled);
        adapter.publishReservationDelivered(delivered);
        adapter.publishReservationReturned(returned);

        verify(rabbitTemplate).convertAndSend(EXCHANGE, "bookings.reservation.created", created);
        verify(rabbitTemplate).convertAndSend(EXCHANGE, "bookings.reservation.cancelled", cancelled);
        verify(rabbitTemplate).convertAndSend(EXCHANGE, "bookings.reservation.delivered", delivered);
        verify(rabbitTemplate).convertAndSend(EXCHANGE, "bookings.reservation.returned", returned);
    }
}

