package com.reservas.sk.bookings_service.application.port.out;

import com.reservas.sk.bookings_service.application.usecase.ReservationCancelledEvent;
import com.reservas.sk.bookings_service.application.usecase.ReservationCreatedEvent;

public interface ReservationRealtimePort {
    // Human Check 🛡️: puerto para publicar actualizaciones en tiempo real a otras pestañas.
    void publishReservationCreated(ReservationCreatedEvent event);

    void publishReservationCancelled(ReservationCancelledEvent event);
}

