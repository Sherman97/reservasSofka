package com.reservas.sk.bookings_service.application.port.out;

import com.reservas.sk.bookings_service.application.usecase.ReservationCancelledEvent;
import com.reservas.sk.bookings_service.application.usecase.ReservationCreatedEvent;
import com.reservas.sk.bookings_service.application.usecase.ReservationDeliveredEvent;
import com.reservas.sk.bookings_service.application.usecase.ReservationReturnedEvent;

public interface ReservationEventPublisherPort {
    void publishReservationCreated(ReservationCreatedEvent event);

    void publishReservationCancelled(ReservationCancelledEvent event);

    void publishReservationDelivered(ReservationDeliveredEvent event);

    void publishReservationReturned(ReservationReturnedEvent event);
}




