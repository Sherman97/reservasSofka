package com.reservas.sk.bookings_service;

import com.reservas.sk.bookings_service.application.port.out.ReservationEventPublisherPort;
import com.reservas.sk.bookings_service.application.port.out.BookingPersistencePort;
import com.reservas.sk.bookings_service.application.usecase.ReservationCancelledEvent;
import com.reservas.sk.bookings_service.application.usecase.ReservationCreatedEvent;
import com.reservas.sk.bookings_service.application.usecase.ReservationDeliveredEvent;
import com.reservas.sk.bookings_service.application.usecase.ReservationReturnedEvent;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@Tag("integration")
@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:bookings_ctx;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "app.jwt.secret=test-secret-key-for-bookings-service-1234567890-abcdef"
})
class BookingsServiceApplicationTests {
    private static final String ASSERT_MSG = "PMD UnitTestAssertionsShouldIncludeMessage";
    @Autowired
    private BookingPersistencePort reservationPersistencePort;

    @Test
    void contextLoads() {
        assertNotNull(reservationPersistencePort, ASSERT_MSG);
    }

    @TestConfiguration
    static class StubConfig {
        @Bean
        ReservationEventPublisherPort reservationEventPublisherPort() {
            return new ReservationEventPublisherPort() {
                @Override
                public void publishReservationCreated(ReservationCreatedEvent event) {
                }

                @Override
                public void publishReservationCancelled(ReservationCancelledEvent event) {
                }

                @Override
                public void publishReservationDelivered(ReservationDeliveredEvent event) {
                }

                @Override
                public void publishReservationReturned(ReservationReturnedEvent event) {
                }
            };
        }
    }
}




