package com.reservas.sk.notifications_service.adapters.in.rabbitmq;

import com.reservas.sk.notifications_service.application.service.InAppNotificationService;
import com.reservas.sk.notifications_service.domain.Reserva;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.amqp.rabbit.annotation.RabbitListener;

import java.time.LocalDateTime;

import static org.mockito.Mockito.*;

class RabbitMqEventListenerTest {
    @Mock
    private InAppNotificationService inAppNotificationService;
    @InjectMocks
    private RabbitMqEventListener rabbitMqEventListener;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void consumeReservationEventYDispararServicio() throws Exception {
        LocalDateTime fin = LocalDateTime.now().plusMinutes(15);
        Reserva reserva = new Reserva(1L, "Sala A", fin, true, false, false);

        // Simular que se consume un evento de RabbitMQ
        rabbitMqEventListener.onReservationCreated(reserva);

        // Verificar que el servicio fue llamado
        verify(inAppNotificationService, atLeastOnce()).notificar15MinAntes(reserva);
    }

    @Test
    void consumeReservationEventCanceledNoDispara() throws Exception {
        LocalDateTime fin = LocalDateTime.now().plusMinutes(15);
        Reserva reservaCancelada = new Reserva(2L, "Sala B", fin, false, false, false);

        // Simular que se consume un evento de cancelación
        rabbitMqEventListener.onReservationCanceled(reservaCancelada);

        // Verificar que no dispara notificaciones para reservas canceladas
        verify(inAppNotificationService, never()).notificar15MinAntes(reservaCancelada);
    }
}

