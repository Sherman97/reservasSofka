package com.reservas.sk.bookings_service.adapters.out.websocket;

import com.reservas.sk.bookings_service.application.port.out.ReservationRealtimePort;
import com.reservas.sk.bookings_service.application.usecase.ReservationCancelledEvent;
import com.reservas.sk.bookings_service.application.usecase.ReservationCreatedEvent;
import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@SuppressFBWarnings(
        value = "EI_EXPOSE_REP2",
        justification = "Spring messaging template is injected and managed by the container."
)
public class StompReservationRealtimeAdapter implements ReservationRealtimePort {
    private final SimpMessagingTemplate messagingTemplate;

    public StompReservationRealtimeAdapter(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    public void publishReservationCreated(ReservationCreatedEvent event) {
        // Human Check 🛡️: notifica por topic general y especifico para que otras pestañas refresquen inmediatamente.
        Map<String, Object> payload = Map.of("type", "reservation.created", "data", event);
        messagingTemplate.convertAndSend("/topic/bookings.reservations", payload);
        messagingTemplate.convertAndSend("/topic/bookings.reservations.created", payload);
    }

    @Override
    public void publishReservationCancelled(ReservationCancelledEvent event) {
        Map<String, Object> payload = Map.of("type", "reservation.cancelled", "data", event);
        messagingTemplate.convertAndSend("/topic/bookings.reservations", payload);
        messagingTemplate.convertAndSend("/topic/bookings.reservations.cancelled", payload);
    }
}

