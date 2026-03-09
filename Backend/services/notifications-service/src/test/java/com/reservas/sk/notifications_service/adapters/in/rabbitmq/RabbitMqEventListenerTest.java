package com.reservas.sk.notifications_service.adapters.in.rabbitmq;

import com.reservas.sk.notifications_service.adapters.in.rabbit.RabbitEventListenerAdapter;
import com.reservas.sk.notifications_service.application.port.in.EventBroadcastUseCase;
import com.reservas.sk.notifications_service.application.service.ReservationReminderApplicationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Map;

import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

class RabbitMqEventListenerTest {
    @Mock
    private EventBroadcastUseCase eventBroadcastUseCase;
    @Mock
    private ReservationReminderApplicationService reservationReminderApplicationService;

    @InjectMocks
    private RabbitEventListenerAdapter rabbitMqEventListener;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void consumeEvent_disparaBroadcastYReminderService() {
        Map<String, Object> payload = Map.of(
                "reservationId", 1L,
                "userId", 2L,
                "spaceId", 3L,
                "endAt", "2026-03-01T20:00:00Z"
        );

        rabbitMqEventListener.onEvent(payload, "bookings.reservation.created");

        verify(eventBroadcastUseCase, times(1)).broadcast("bookings.reservation.created", payload);
        verify(reservationReminderApplicationService, times(1))
                .handleEvent("bookings.reservation.created", payload);
    }

    @Test
    void consumeEvent_conPayloadNulo_disparaConNuloSinExplotar() {
        rabbitMqEventListener.onEvent(null, "bookings.reservation.cancelled");

        verify(eventBroadcastUseCase, times(1)).broadcast("bookings.reservation.cancelled", null);
        verify(reservationReminderApplicationService, times(1))
                .handleEvent("bookings.reservation.cancelled", null);
    }
}
