package com.reservas.sk.bookings_service.adapters.in.web;

import com.reservas.sk.bookings_service.adapters.in.web.dto.CancelReservationRequest;
import com.reservas.sk.bookings_service.adapters.in.web.dto.CreateReservationRequest;
import com.reservas.sk.bookings_service.adapters.in.web.dto.HandoverReservationRequest;
import com.reservas.sk.bookings_service.adapters.in.web.dto.ReservationResponse;
import com.reservas.sk.bookings_service.adapters.in.web.dto.SpaceAvailabilityResponse;
import com.reservas.sk.bookings_service.application.port.in.BookingUseCase;
import com.reservas.sk.bookings_service.application.usecase.AuthenticatedUser;
import com.reservas.sk.bookings_service.application.usecase.CreateReservationCommand;
import com.reservas.sk.bookings_service.application.usecase.HandoverReservationCommand;
import com.reservas.sk.bookings_service.domain.model.Reservation;
import com.reservas.sk.bookings_service.domain.model.ReservationEquipment;
import com.reservas.sk.bookings_service.domain.model.SpaceAvailability;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class BookingControllerUnitTest {
    private static final String ASSERT_MSG = "PMD UnitTestAssertionsShouldIncludeMessage";
    private static final String STATUS_CONFIRMED = "confirmed";
    private static final String STATUS_CANCELLED = "cancelled";

    private BookingUseCase bookingUseCase;
    private BookingHttpMapper mapper;
    private BookingController controller;

    @BeforeEach
    void setUp() {
        bookingUseCase = mock(BookingUseCase.class);
        mapper = new BookingHttpMapper();
        controller = new BookingController(bookingUseCase, mapper);
    }

    @Test
    void checkAvailability_returnsSuccessPayload() {
        when(bookingUseCase.checkAvailability(any())).thenReturn(new SpaceAvailability(true, 0));

        var response = controller.checkAvailability(10L, "2026-03-01T10:00:00Z", "2026-03-01T11:00:00Z");

        assertTrue(response.ok(), ASSERT_MSG);
        SpaceAvailabilityResponse data = response.data();
        assertTrue(data.available(), ASSERT_MSG);
        assertEquals(0, data.overlappingReservations(), ASSERT_MSG);
    }

    @Test
    void createReservation_usesAuthenticatedUserAndReturnsCreated() {
        Reservation reservation = reservation(33L, STATUS_CONFIRMED);
        when(bookingUseCase.createReservation(any())).thenReturn(reservation);

        CreateReservationRequest request = new CreateReservationRequest(
                10L,
                "2026-03-01T10:00:00Z",
                "2026-03-01T11:00:00Z",
                "Titulo",
                4,
                "nota",
                List.of(1L, 2L)
        );
        var response = controller.createReservation(
                request,
                new AuthenticatedUser(88L, "u@test.com")
        );

        assertEquals(HttpStatus.CREATED, response.getStatusCode(), ASSERT_MSG);
        assertTrue(response.getBody().ok(), ASSERT_MSG);
        assertEquals(33L, response.getBody().data().id(), ASSERT_MSG);

        ArgumentCaptor<CreateReservationCommand> captor =
                ArgumentCaptor.forClass(CreateReservationCommand.class);
        verify(bookingUseCase).createReservation(captor.capture());
        assertEquals(88L, captor.getValue().userId(), ASSERT_MSG);
    }

    @Test
    void listAndGetById_returnMappedPayloads() {
        when(bookingUseCase.listReservations(any())).thenReturn(
                List.of(
                        reservation(1L, STATUS_CONFIRMED),
                        reservation(2L, STATUS_CANCELLED)
                )
        );
        when(bookingUseCase.getReservationById(1L)).thenReturn(reservation(1L, STATUS_CONFIRMED));

        var list = controller.listReservations(9L, 10L, STATUS_CONFIRMED);
        var one = controller.getById(1L);

        assertEquals(2, list.data().size(), ASSERT_MSG);
        assertEquals(1L, one.data().id(), ASSERT_MSG);
    }

    @Test
    void cancel_usesReasonAndSupportsNullRequest() {
        when(bookingUseCase.cancelReservation(7L, "motivo")).thenReturn(reservation(7L, STATUS_CANCELLED));
        when(bookingUseCase.cancelReservation(8L, null)).thenReturn(reservation(8L, STATUS_CANCELLED));

        ReservationResponse withReason = controller.cancel(7L, new CancelReservationRequest("motivo")).data();
        ReservationResponse withoutBody = controller.cancel(8L, null).data();

        assertEquals(STATUS_CANCELLED, withReason.status(), ASSERT_MSG);
        assertEquals(STATUS_CANCELLED, withoutBody.status(), ASSERT_MSG);
    }

    @Test
    void deliver_usesAuthenticatedStaffAndNovelty() {
        when(bookingUseCase.deliverReservation(any())).thenReturn(reservation(9L, "in_progress"));

        var delivered = controller.deliver(
                9L,
                new HandoverReservationRequest("ok"),
                new AuthenticatedUser(99L, "staff@test.com")
        );

        assertEquals("in_progress", delivered.data().status(), ASSERT_MSG);

        ArgumentCaptor<HandoverReservationCommand> captor =
                ArgumentCaptor.forClass(HandoverReservationCommand.class);
        verify(bookingUseCase).deliverReservation(captor.capture());
        assertEquals(99L, captor.getValue().staffId(), ASSERT_MSG);
        assertEquals("ok", captor.getValue().novelty(), ASSERT_MSG);
    }

    @Test
    void return_usesAuthenticatedStaffAndNullNoveltyWhenRequestMissing() {
        when(bookingUseCase.returnReservation(any())).thenReturn(reservation(9L, "completed"));

        var returned = controller.markReturned(9L, null, new AuthenticatedUser(99L, "staff@test.com"));

        assertEquals("completed", returned.data().status(), ASSERT_MSG);

        ArgumentCaptor<HandoverReservationCommand> captorReturn =
                ArgumentCaptor.forClass(HandoverReservationCommand.class);
        verify(bookingUseCase).returnReservation(captorReturn.capture());
        assertEquals(99L, captorReturn.getValue().staffId(), ASSERT_MSG);
        assertNull(captorReturn.getValue().novelty(), ASSERT_MSG);
    }

    private Reservation reservation(long id, String status) {
        return new Reservation(
                id,
                88L,
                10L,
                Instant.parse("2026-03-01T10:00:00Z"),
                Instant.parse("2026-03-01T11:00:00Z"),
                status,
                "Titulo",
                4,
                "nota",
                null,
                Instant.parse("2026-03-01T09:00:00Z"),
                List.of(new ReservationEquipment(1L, id, 2L, "requested", null, null, null, null, null))
        );
    }
}


