package com.reservas.sk.bookings_service.application.service;

import com.reservas.sk.bookings_service.application.port.out.BookingPersistencePort;
import com.reservas.sk.bookings_service.application.port.out.ReservationEventPublisherPort;
import com.reservas.sk.bookings_service.application.usecase.AdminListReservationsQuery;
import com.reservas.sk.bookings_service.exception.ApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class AdminReservationQueryApplicationServiceTest {
    private static final String ASSERT_MSG = "PMD UnitTestAssertionsShouldIncludeMessage";

    @Mock
    private BookingPersistencePort persistencePort;

    @Mock
    private ReservationEventPublisherPort eventPublisherPort;

    private BookingApplicationService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new BookingApplicationService(persistencePort, eventPublisherPort);
    }

    @Test
    void listAdminReservations_rejectsStatusOutsideHuWhitelist() {
        AdminListReservationsQuery query = new AdminListReservationsQuery(
                "2026-04-01T00:00:00Z",
                "2026-04-30T23:59:59Z",
                "in_progress",
                10L,
                20L,
                0,
                20
        );

        ApiException ex = assertThrows(ApiException.class, () -> service.listAdminReservations(query));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus(), ASSERT_MSG);
        assertEquals(
                "estado invalido. Use: Pendiente, Confirmada, Cancelada, Finalizada",
                ex.getMessage(),
                ASSERT_MSG
        );
    }

    @Test
    void listAdminReservations_rejectsInvalidExecutionDateRange() {
        AdminListReservationsQuery query = new AdminListReservationsQuery(
                "2026-04-30T23:59:59Z",
                "2026-04-01T00:00:00Z",
                "Confirmada",
                null,
                null,
                0,
                20
        );

        ApiException ex = assertThrows(ApiException.class, () -> service.listAdminReservations(query));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus(), ASSERT_MSG);
        assertEquals("desde debe ser menor o igual que hasta", ex.getMessage(), ASSERT_MSG);
    }
}
