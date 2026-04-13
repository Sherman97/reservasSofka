package com.reservas.sk.bookings_service.adapters.out.messaging;

import com.reservas.sk.bookings_service.application.usecase.ReservationCancelledEvent;
import com.reservas.sk.bookings_service.application.usecase.ReservationCreatedEvent;
import com.reservas.sk.bookings_service.application.usecase.ReservationDeliveredEvent;
import com.reservas.sk.bookings_service.application.usecase.ReservationReturnedEvent;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

class NoOpReservationEventPublisherAdapterTest {

    @Test
    void noOpMethodsDoNotThrow() {
        NoOpReservationEventPublisherAdapter adapter = new NoOpReservationEventPublisherAdapter();

        ReservationCreatedEvent createdEvent = new ReservationCreatedEvent(
                1L,
                2L,
                3L,
                "confirmed",
                "2026-03-01T10:00:00Z",
                "2026-03-01T11:00:00Z",
                List.of(),
                Instant.now()
        );
        ReservationCancelledEvent cancelledEvent = new ReservationCancelledEvent(
                1L,
                2L,
                3L,
                "cancelled",
                "x",
                Instant.now()
        );
        ReservationDeliveredEvent deliveredEvent = new ReservationDeliveredEvent(
                1L,
                2L,
                3L,
                9L,
                "in_progress",
                null,
                "2026-03-01T11:00:00Z",
                Instant.now()
        );
        ReservationReturnedEvent returnedEvent = new ReservationReturnedEvent(
                1L,
                2L,
                3L,
                9L,
                "completed",
                null,
                "2026-03-01T11:00:00Z",
                Instant.now()
        );

        assertDoesNotThrow(() -> adapter.publishReservationCreated(createdEvent));
        assertDoesNotThrow(() -> adapter.publishReservationCancelled(cancelledEvent));
        assertDoesNotThrow(() -> adapter.publishReservationDelivered(deliveredEvent));
        assertDoesNotThrow(() -> adapter.publishReservationReturned(returnedEvent));
    }
}
