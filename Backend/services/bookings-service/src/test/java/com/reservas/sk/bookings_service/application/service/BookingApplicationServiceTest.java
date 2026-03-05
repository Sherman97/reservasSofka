package com.reservas.sk.bookings_service.application.service;

import com.reservas.sk.bookings_service.application.port.out.BookingPersistencePort;
import com.reservas.sk.bookings_service.application.port.out.ReservationEventPublisherPort;
import com.reservas.sk.bookings_service.application.usecase.CheckSpaceAvailabilityQuery;
import com.reservas.sk.bookings_service.application.usecase.CreateReservationCommand;
import com.reservas.sk.bookings_service.application.usecase.HandoverReservationCommand;
import com.reservas.sk.bookings_service.application.usecase.ListReservationsQuery;
import com.reservas.sk.bookings_service.domain.model.Reservation;
import com.reservas.sk.bookings_service.domain.model.ReservationEquipment;
import com.reservas.sk.bookings_service.domain.model.SpaceAvailability;
import com.reservas.sk.bookings_service.exception.ApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class BookingApplicationServiceTest {
    private static final String ASSERT_MSG = "PMD UnitTestAssertionsShouldIncludeMessage";
    private static final String START_AT = "2026-03-01T10:00:00Z";
    private static final String END_AT = "2026-03-01T12:00:00Z";
    private static final String STATUS_CONFIRMED = "confirmed";
    private static final String STATUS_CANCELLED = "cancelled";
    private static final String STATUS_COMPLETED = "completed";
    private static final String STATUS_IN_PROGRESS = "in_progress";
    private static final String CANCELLATION_REASON = "motivo";
    @Mock
    private BookingPersistencePort persistencePort;
    @Mock
    private ReservationEventPublisherPort eventPublisherPort;
    @InjectMocks
    private BookingApplicationService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void checkAvailability_ok() {
        CheckSpaceAvailabilityQuery query = new CheckSpaceAvailabilityQuery(1L, START_AT, END_AT);
        when(persistencePort.countOverlappingReservations(anyLong(), any(), any())).thenReturn(0);

        SpaceAvailability result = service.checkAvailability(query);

        assertTrue(result.available(), ASSERT_MSG);
        assertEquals(0, result.overlappingReservations(), ASSERT_MSG);
    }

    @Test
    void checkAvailability_conflict() {
        CheckSpaceAvailabilityQuery query = new CheckSpaceAvailabilityQuery(1L, START_AT, END_AT);
        when(persistencePort.countOverlappingReservations(anyLong(), any(), any())).thenReturn(2);

        SpaceAvailability result = service.checkAvailability(query);

        assertFalse(result.available(), ASSERT_MSG);
        assertEquals(2, result.overlappingReservations(), ASSERT_MSG);
    }

    @Test
    void checkAvailability_badRequestWhenSpaceIdIsInvalid() {
        CheckSpaceAvailabilityQuery query = new CheckSpaceAvailabilityQuery(0L, START_AT, END_AT);

        ApiException ex = assertThrows(ApiException.class, () -> service.checkAvailability(query));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus(), ASSERT_MSG);
    }

    @Test
    void checkAvailability_badRequestWhenRangeIsInvalid() {
        CheckSpaceAvailabilityQuery query = new CheckSpaceAvailabilityQuery(1L, END_AT, START_AT);

        ApiException ex = assertThrows(ApiException.class, () -> service.checkAvailability(query));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus(), ASSERT_MSG);
    }

    @Test
    void createReservation_userNotFound() {
        CreateReservationCommand cmd = baseCommand(List.of());
        when(persistencePort.userExists(1L)).thenReturn(false);

        ApiException ex = assertThrows(ApiException.class, () -> service.createReservation(cmd));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus(), ASSERT_MSG);
    }

    @Test
    void createReservation_spaceNotFound() {
        CreateReservationCommand cmd = baseCommand(List.of());
        when(persistencePort.userExists(1L)).thenReturn(true);
        when(persistencePort.findSpaceCityId(2L)).thenReturn(Optional.empty());

        ApiException ex = assertThrows(ApiException.class, () -> service.createReservation(cmd));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus(), ASSERT_MSG);
    }

    @Test
    void createReservation_lockTimeout() {
        CreateReservationCommand cmd = baseCommand(List.of());
        when(persistencePort.userExists(1L)).thenReturn(true);
        when(persistencePort.findSpaceCityId(2L)).thenReturn(Optional.of(3L));
        when(persistencePort.acquireSpaceReservationLock(2L, 5)).thenReturn(false);

        ApiException ex = assertThrows(ApiException.class, () -> service.createReservation(cmd));

        assertEquals(HttpStatus.CONFLICT, ex.getStatus(), ASSERT_MSG);
        assertEquals("SPACE_LOCK_TIMEOUT", ex.getErrorCode(), ASSERT_MSG);
        verify(persistencePort, never()).releaseSpaceReservationLock(anyLong());
    }

    @Test
    void createReservation_conflictoPorSolape() {
        CreateReservationCommand cmd = baseCommand(List.of());
        when(persistencePort.userExists(1L)).thenReturn(true);
        when(persistencePort.findSpaceCityId(2L)).thenReturn(Optional.of(3L));
        when(persistencePort.acquireSpaceReservationLock(2L, 5)).thenReturn(true);
        when(persistencePort.countOverlappingReservations(anyLong(), any(), any())).thenReturn(1);

        ApiException ex = assertThrows(ApiException.class, () -> service.createReservation(cmd));

        assertEquals(HttpStatus.CONFLICT, ex.getStatus(), ASSERT_MSG);
        assertEquals("SPACE_ALREADY_RESERVED", ex.getErrorCode(), ASSERT_MSG);
        verify(persistencePort, times(1)).releaseSpaceReservationLock(2L);
    }

    @Test
    void createReservation_failsWhenEquipmentNotFound() {
        CreateReservationCommand cmd = baseCommand(List.of(11L, 12L));
        when(persistencePort.userExists(1L)).thenReturn(true);
        when(persistencePort.findSpaceCityId(2L)).thenReturn(Optional.of(3L));
        when(persistencePort.acquireSpaceReservationLock(2L, 5)).thenReturn(true);
        when(persistencePort.countOverlappingReservations(anyLong(), any(), any())).thenReturn(0);
        when(persistencePort.findExistingEquipmentIds(List.of(11L, 12L))).thenReturn(List.of(11L));

        ApiException ex = assertThrows(ApiException.class, () -> service.createReservation(cmd));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus(), ASSERT_MSG);
        assertEquals("EQUIPMENT_NOT_FOUND", ex.getErrorCode(), ASSERT_MSG);
    }

    @Test
    void createReservation_failsWhenEquipmentUnavailable() {
        CreateReservationCommand cmd = baseCommand(List.of(11L));
        when(persistencePort.userExists(1L)).thenReturn(true);
        when(persistencePort.findSpaceCityId(2L)).thenReturn(Optional.of(3L));
        when(persistencePort.acquireSpaceReservationLock(2L, 5)).thenReturn(true);
        when(persistencePort.countOverlappingReservations(anyLong(), any(), any())).thenReturn(0);
        when(persistencePort.findExistingEquipmentIds(List.of(11L))).thenReturn(List.of(11L));
        when(persistencePort.findUnavailableEquipmentIds(List.of(11L))).thenReturn(List.of(11L));

        ApiException ex = assertThrows(ApiException.class, () -> service.createReservation(cmd));

        assertEquals(HttpStatus.CONFLICT, ex.getStatus(), ASSERT_MSG);
        assertEquals("EQUIPMENT_UNAVAILABLE", ex.getErrorCode(), ASSERT_MSG);
    }

    @Test
    void createReservation_failsWhenEquipmentOutsideCity() {
        CreateReservationCommand cmd = baseCommand(List.of(11L));
        when(persistencePort.userExists(1L)).thenReturn(true);
        when(persistencePort.findSpaceCityId(2L)).thenReturn(Optional.of(3L));
        when(persistencePort.acquireSpaceReservationLock(2L, 5)).thenReturn(true);
        when(persistencePort.countOverlappingReservations(anyLong(), any(), any())).thenReturn(0);
        when(persistencePort.findExistingEquipmentIds(List.of(11L))).thenReturn(List.of(11L));
        when(persistencePort.findUnavailableEquipmentIds(List.of(11L))).thenReturn(List.of());
        when(persistencePort.findEquipmentIdsOutsideCity(List.of(11L), 3L)).thenReturn(List.of(11L));

        ApiException ex = assertThrows(ApiException.class, () -> service.createReservation(cmd));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus(), ASSERT_MSG);
        assertEquals("EQUIPMENT_OUTSIDE_CITY", ex.getErrorCode(), ASSERT_MSG);
    }

    @Test
    void createReservation_invalidEquipmentIds() {
        CreateReservationCommand cmd = baseCommand(Arrays.asList(11L, null));
        when(persistencePort.userExists(1L)).thenReturn(true);
        when(persistencePort.findSpaceCityId(2L)).thenReturn(Optional.of(3L));
        when(persistencePort.acquireSpaceReservationLock(2L, 5)).thenReturn(true);
        when(persistencePort.countOverlappingReservations(anyLong(), any(), any())).thenReturn(0);

        ApiException ex = assertThrows(ApiException.class, () -> service.createReservation(cmd));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus(), ASSERT_MSG);
    }

    @Test
    void createReservation_exitoso_publicaEventoYLiberarLock() {
        CreateReservationCommand cmd = baseCommand(List.of(11L, 11L, 12L));
        Reservation storedReservation = reservation(10L, STATUS_CONFIRMED);

        when(persistencePort.userExists(1L)).thenReturn(true);
        when(persistencePort.findSpaceCityId(2L)).thenReturn(Optional.of(3L));
        when(persistencePort.acquireSpaceReservationLock(2L, 5)).thenReturn(true);
        when(persistencePort.countOverlappingReservations(anyLong(), any(), any())).thenReturn(0);
        when(persistencePort.findExistingEquipmentIds(List.of(11L, 12L))).thenReturn(List.of(11L, 12L));
        when(persistencePort.findUnavailableEquipmentIds(List.of(11L, 12L))).thenReturn(List.of());
        when(persistencePort.findEquipmentIdsOutsideCity(List.of(11L, 12L), 3L)).thenReturn(List.of());
        when(persistencePort.insertReservation(anyLong(), anyLong(), any(), any(), anyString(), any(), any(), any())).thenReturn(10L);
        when(persistencePort.findReservationById(10L)).thenReturn(Optional.of(storedReservation));
        when(persistencePort.findReservationEquipments(10L)).thenReturn(List.of(
                new ReservationEquipment(1L, 10L, 11L, "requested", null, null, null, null, null),
                new ReservationEquipment(2L, 10L, 12L, "requested", null, null, null, null, null)
        ));

        Reservation result = service.createReservation(cmd);

        assertNotNull(result, ASSERT_MSG);
        assertEquals(10L, result.getId(), ASSERT_MSG);
        verify(eventPublisherPort, times(1)).publishReservationCreated(any());
        verify(persistencePort, times(1)).releaseSpaceReservationLock(2L);
    }

    @Test
    void createReservation_continuesWhenEventPublishFails() {
        CreateReservationCommand cmd = baseCommand(List.of());
        Reservation storedReservation = reservation(10L, STATUS_CONFIRMED);

        when(persistencePort.userExists(1L)).thenReturn(true);
        when(persistencePort.findSpaceCityId(2L)).thenReturn(Optional.of(3L));
        when(persistencePort.acquireSpaceReservationLock(2L, 5)).thenReturn(true);
        when(persistencePort.countOverlappingReservations(anyLong(), any(), any())).thenReturn(0);
        when(persistencePort.insertReservation(anyLong(), anyLong(), any(), any(), anyString(), any(), any(), any())).thenReturn(10L);
        when(persistencePort.findReservationById(10L)).thenReturn(Optional.of(storedReservation));
        when(persistencePort.findReservationEquipments(10L)).thenReturn(List.of());
        doThrow(new RuntimeException("rabbit down")).when(eventPublisherPort).publishReservationCreated(any());

        Reservation result = service.createReservation(cmd);

        assertEquals(10L, result.getId(), ASSERT_MSG);
        verify(persistencePort).releaseSpaceReservationLock(2L);
    }

    @Test
    void createReservation_ignoresReleaseLockFailure() {
        CreateReservationCommand cmd = baseCommand(List.of());
        Reservation storedReservation = reservation(10L, STATUS_CONFIRMED);

        when(persistencePort.userExists(1L)).thenReturn(true);
        when(persistencePort.findSpaceCityId(2L)).thenReturn(Optional.of(3L));
        when(persistencePort.acquireSpaceReservationLock(2L, 5)).thenReturn(true);
        when(persistencePort.countOverlappingReservations(anyLong(), any(), any())).thenReturn(0);
        when(persistencePort.insertReservation(anyLong(), anyLong(), any(), any(), anyString(), any(), any(), any()))
                .thenReturn(10L);
        when(persistencePort.findReservationById(10L)).thenReturn(Optional.of(storedReservation));
        when(persistencePort.findReservationEquipments(10L)).thenReturn(List.of());
        doThrow(new RuntimeException("cannot release")).when(persistencePort).releaseSpaceReservationLock(2L);

        Reservation result = service.createReservation(cmd);

        assertEquals(10L, result.getId(), ASSERT_MSG);
        verify(eventPublisherPort).publishReservationCreated(any());
    }

    @Test
    void listReservations_withFiltersAndEquipments() {
        Reservation reservation = reservation(20L, STATUS_CONFIRMED);
        when(persistencePort.listReservations(1L, 2L, STATUS_CONFIRMED)).thenReturn(List.of(reservation));
        when(persistencePort.findReservationEquipmentsByReservationIds(List.of(20L))).thenReturn(Map.of(
                20L,
                List.of(new ReservationEquipment(10L, 20L, 30L, "requested", null, null, null, null, null))
        ));

        List<Reservation> result = service.listReservations(new ListReservationsQuery(1L, 2L, " confirmed "));

        assertEquals(1, result.size(), ASSERT_MSG);
        assertEquals(1, result.get(0).getEquipments().size(), ASSERT_MSG);
    }

    @Test
    void listReservations_invalidStatus() {
        ApiException ex = assertThrows(ApiException.class,
                () -> service.listReservations(new ListReservationsQuery(null, null, "other")));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus(), ASSERT_MSG);
    }

    @Test
    void listReservations_returnsEmptyWhenPortHasNoRows() {
        when(persistencePort.listReservations(null, null, null)).thenReturn(List.of());

        List<Reservation> result = service.listReservations(new ListReservationsQuery(null, null, null));

        assertTrue(result.isEmpty(), ASSERT_MSG);
        verify(persistencePort, never()).findReservationEquipmentsByReservationIds(any());
    }

    @Test
    void listReservations_blankStatusIsTreatedAsNull() {
        when(persistencePort.listReservations(1L, null, null)).thenReturn(List.of());

        List<Reservation> result = service.listReservations(new ListReservationsQuery(1L, null, "   "));

        assertTrue(result.isEmpty(), ASSERT_MSG);
        verify(persistencePort).listReservations(1L, null, null);
    }

    @Test
    void getReservationById_notFound() {
        when(persistencePort.findReservationById(99L)).thenReturn(Optional.empty());

        ApiException ex = assertThrows(ApiException.class, () -> service.getReservationById(99L));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus(), ASSERT_MSG);
    }

    @Test
    void cancelReservation_alreadyCancelled() {
        when(persistencePort.findReservationById(7L)).thenReturn(Optional.of(reservation(7L, STATUS_CANCELLED)));
        when(persistencePort.findReservationEquipments(7L)).thenReturn(List.of());

        ApiException ex = assertThrows(ApiException.class, () -> service.cancelReservation(7L, "x"));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus(), ASSERT_MSG);
    }

    @Test
    void cancelReservation_successEvenWhenEventFails() {
        Reservation confirmed = reservation(7L, STATUS_CONFIRMED);
        Reservation cancelled = new Reservation(
                7L, 1L, 2L,
                Instant.parse(START_AT),
                Instant.parse(END_AT),
                STATUS_CANCELLED, "Reserva", 2, null, CANCELLATION_REASON,
                Instant.parse("2026-03-01T09:00:00Z"), List.of()
        );

        when(persistencePort.findReservationById(7L)).thenReturn(Optional.of(confirmed), Optional.of(cancelled));
        when(persistencePort.findReservationEquipments(7L)).thenReturn(List.of(), List.of());
        doThrow(new RuntimeException("event fail")).when(eventPublisherPort).publishReservationCancelled(any());

        Reservation result = service.cancelReservation(7L, CANCELLATION_REASON);

        assertEquals(STATUS_CANCELLED, result.getStatus(), ASSERT_MSG);
        verify(persistencePort).updateReservationCancellation(7L, STATUS_CANCELLED, CANCELLATION_REASON);
    }

    @Test
    void cancelReservation_successPublishesEvent() {
        Reservation confirmed = reservation(8L, STATUS_CONFIRMED);
        Reservation cancelled = reservation(8L, STATUS_CANCELLED);

        when(persistencePort.findReservationById(8L)).thenReturn(Optional.of(confirmed), Optional.of(cancelled));
        when(persistencePort.findReservationEquipments(8L)).thenReturn(List.of(), List.of());

        Reservation result = service.cancelReservation(8L, CANCELLATION_REASON);

        assertEquals(STATUS_CANCELLED, result.getStatus(), ASSERT_MSG);
        verify(eventPublisherPort).publishReservationCancelled(any());
    }

    @Test
    void deliverReservation_invalidStatus() {
        when(persistencePort.findReservationById(7L)).thenReturn(Optional.of(reservation(7L, STATUS_COMPLETED)));
        when(persistencePort.findReservationEquipments(7L)).thenReturn(List.of());

        ApiException ex = assertThrows(ApiException.class,
                () -> service.deliverReservation(new HandoverReservationCommand(7L, 50L, "ok")));

        assertEquals(HttpStatus.CONFLICT, ex.getStatus(), ASSERT_MSG);
        assertEquals("INVALID_RESERVATION_STATUS", ex.getErrorCode(), ASSERT_MSG);
    }

    @Test
    void deliverReservation_success() {
        Reservation existing = reservation(7L, STATUS_CONFIRMED);
        Reservation delivered = reservation(7L, STATUS_IN_PROGRESS);

        when(persistencePort.findReservationById(7L)).thenReturn(Optional.of(existing), Optional.of(delivered));
        when(persistencePort.findReservationEquipments(7L)).thenReturn(List.of(), List.of());

        Reservation result = service.deliverReservation(new HandoverReservationCommand(7L, 50L, "novedad"));

        assertEquals(STATUS_IN_PROGRESS, result.getStatus(), ASSERT_MSG);
        verify(persistencePort).updateReservationStatus(7L, STATUS_IN_PROGRESS);
        verify(persistencePort).markReservationEquipmentsDelivered(anyLong(), anyLong(), any(), anyString());
        verify(persistencePort).insertReservationHandoverLog(anyLong(), anyLong(), anyLong(), anyLong(), anyString(), anyString(), any());
    }

    @Test
    void deliverReservation_invalidStatusWhenReservationStatusIsNull() {
        Reservation existing = reservation(7L, null);
        when(persistencePort.findReservationById(7L)).thenReturn(Optional.of(existing));
        when(persistencePort.findReservationEquipments(7L)).thenReturn(List.of());

        ApiException ex = assertThrows(
                ApiException.class,
                () -> service.deliverReservation(new HandoverReservationCommand(7L, 50L, "ok"))
        );

        assertEquals(HttpStatus.CONFLICT, ex.getStatus(), ASSERT_MSG);
    }

    @Test
    void deliverReservation_successEvenWhenEventFails() {
        Reservation existing = reservation(7L, STATUS_CONFIRMED);
        Reservation delivered = reservation(7L, STATUS_IN_PROGRESS);

        when(persistencePort.findReservationById(7L)).thenReturn(Optional.of(existing), Optional.of(delivered));
        when(persistencePort.findReservationEquipments(7L)).thenReturn(List.of(), List.of());
        doThrow(new RuntimeException("event fail")).when(eventPublisherPort).publishReservationDelivered(any());

        Reservation result = service.deliverReservation(new HandoverReservationCommand(7L, 50L, "novedad"));

        assertEquals(STATUS_IN_PROGRESS, result.getStatus(), ASSERT_MSG);
    }

    @Test
    void returnReservation_success() {
        Reservation existing = reservation(9L, STATUS_IN_PROGRESS);
        Reservation returned = reservation(9L, STATUS_COMPLETED);

        when(persistencePort.findReservationById(9L)).thenReturn(Optional.of(existing), Optional.of(returned));
        when(persistencePort.findReservationEquipments(9L)).thenReturn(List.of(), List.of());

        Reservation result = service.returnReservation(new HandoverReservationCommand(9L, 70L, "ok"));

        assertEquals(STATUS_COMPLETED, result.getStatus(), ASSERT_MSG);
        verify(persistencePort).updateReservationStatus(9L, STATUS_COMPLETED);
        verify(persistencePort).markReservationEquipmentsReturned(anyLong(), anyLong(), any(), anyString());
        verify(persistencePort).insertReservationHandoverLog(anyLong(), anyLong(), anyLong(), anyLong(), anyString(), anyString(), any());
    }

    @Test
    void returnReservation_successEvenWhenEventFails() {
        Reservation existing = reservation(9L, STATUS_IN_PROGRESS);
        Reservation returned = reservation(9L, STATUS_COMPLETED);

        when(persistencePort.findReservationById(9L)).thenReturn(Optional.of(existing), Optional.of(returned));
        when(persistencePort.findReservationEquipments(9L)).thenReturn(List.of(), List.of());
        doThrow(new RuntimeException("event fail")).when(eventPublisherPort).publishReservationReturned(any());

        Reservation result = service.returnReservation(new HandoverReservationCommand(9L, 70L, "ok"));

        assertEquals(STATUS_COMPLETED, result.getStatus(), ASSERT_MSG);
    }

    private CreateReservationCommand baseCommand(List<Long> equipmentIds) {
        return new CreateReservationCommand(1L, 2L, START_AT, END_AT, "Reserva", 2, null, equipmentIds);
    }

    private Reservation reservation(long id, String status) {
        return new Reservation(
                id,
                1L,
                2L,
                Instant.parse(START_AT),
                Instant.parse(END_AT),
                status,
                "Reserva",
                2,
                null,
                null,
                Instant.parse("2026-03-01T09:00:00Z"),
                List.of()
        );
    }
}


