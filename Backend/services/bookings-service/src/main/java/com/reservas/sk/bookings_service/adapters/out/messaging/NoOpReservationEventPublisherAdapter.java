package com.reservas.sk.bookings_service.adapters.out.messaging;

import com.reservas.sk.bookings_service.application.port.out.ReservationEventPublisherPort;
import com.reservas.sk.bookings_service.application.usecase.ReservationCancelledEvent;
import com.reservas.sk.bookings_service.application.usecase.ReservationCreatedEvent;
import com.reservas.sk.bookings_service.application.usecase.ReservationDeliveredEvent;
import com.reservas.sk.bookings_service.application.usecase.ReservationReturnedEvent;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnMissingBean(ReservationEventPublisherPort.class)
public class NoOpReservationEventPublisherAdapter implements ReservationEventPublisherPort {
    @Override
    public void publishReservationCreated(ReservationCreatedEvent event) {
        // RabbitMQ disabled.
    }

    @Override
    public void publishReservationCancelled(ReservationCancelledEvent event) {
        // RabbitMQ disabled.
    }

    @Override
    public void publishReservationDelivered(ReservationDeliveredEvent event) {
        // RabbitMQ disabled.
    }

    @Override
    public void publishReservationReturned(ReservationReturnedEvent event) {
        // RabbitMQ disabled.
    }
}




