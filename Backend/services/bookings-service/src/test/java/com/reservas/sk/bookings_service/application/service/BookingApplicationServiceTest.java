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
        CheckSpaceAvailabilityQuery query = new CheckSpaceAvailabilityQuery(1L, "2026-03-01T10:00:00Z", "2026-03-01T12:00:00Z");
        when(persistencePort.countOverlappingReservations(anyLong(), any(), any())).thenReturn(0);

        SpaceAvailability result = service.checkAvailability(query);

        assertTrue(result.available());
        assertEquals(0, result.overlappingReservations());
    }

    @Test
    void checkAvailability_conflict() {
        CheckSpaceAvailabilityQuery query = new CheckSpaceAvailabilityQuery(1L, "2026-03-01T10:00:00Z", "2026-03-01T12:00:00Z");
        when(persistencePort.countOverlappingReservations(anyLong(), any(), any())).thenReturn(2);

        SpaceAvailability result = service.checkAvailability(query);

        assertFalse(result.available());
        assertEquals(2, result.overlappingReservations());
    }

    @Test
    void createReservation_userNotFound() {
        CreateReservationCommand cmd = baseCommand(List.of());
        when(persistencePort.userExists(1L)).thenReturn(false);

        ApiException ex = assertThrows(ApiException.class, () -> service.createReservation(cmd));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
    }

    @Test
    void createReservation_spaceNotFound() {
        CreateReservationCommand cmd = baseCommand(List.of());
        when(persistencePort.userExists(1L)).thenReturn(true);
        when(persistencePort.findSpaceCityId(2L)).thenReturn(Optional.empty());

        ApiException ex = assertThrows(ApiException.class, () -> service.createReservation(cmd));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
    }

    @Test
    void createReservation_lockTimeout() {
        CreateReservationCommand cmd = baseCommand(List.of());
        when(persistencePort.userExists(1L)).thenReturn(true);
        when(persistencePort.findSpaceCityId(2L)).thenReturn(Optional.of(3L));
        when(persistencePort.acquireSpaceReservationLock(2L, 5)).thenReturn(false);

        ApiException ex = assertThrows(ApiException.class, () -> service.createReservation(cmd));

        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
        assertEquals("SPACE_LOCK_TIMEOUT", ex.getErrorCode());
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

        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
        assertEquals("SPACE_ALREADY_RESERVED", ex.getErrorCode());
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

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertEquals("EQUIPMENT_NOT_FOUND", ex.getErrorCode());
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

        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
        assertEquals("EQUIPMENT_UNAVAILABLE", ex.getErrorCode());
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

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertEquals("EQUIPMENT_OUTSIDE_CITY", ex.getErrorCode());
    }

    @Test
    void createReservation_invalidEquipmentIds() {
        CreateReservationCommand cmd = baseCommand(Arrays.asList(11L, null));
        when(persistencePort.userExists(1L)).thenReturn(true);
        when(persistencePort.findSpaceCityId(2L)).thenReturn(Optional.of(3L));
        when(persistencePort.acquireSpaceReservationLock(2L, 5)).thenReturn(true);
        when(persistencePort.countOverlappingReservations(anyLong(), any(), any())).thenReturn(0);

        ApiException ex = assertThrows(ApiException.class, () -> service.createReservation(cmd));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void createReservation_exitoso_publicaEventoYLiberarLock() {
        CreateReservationCommand cmd = baseCommand(List.of(11L, 11L, 12L));
        Reservation storedReservation = reservation(10L, "confirmed");

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

        assertNotNull(result);
        assertEquals(10L, result.getId());
        verify(persistencePort).insertReservationEquipment(10L, 11L, "requested");
        verify(persistencePort).insertReservationEquipment(10L, 12L, "requested");
        verify(eventPublisherPort, times(1)).publishReservationCreated(any());
        verify(persistencePort, times(1)).releaseSpaceReservationLock(2L);
    }

    @Test
    void createReservation_continuesWhenEventPublishFails() {
        CreateReservationCommand cmd = baseCommand(List.of());
        Reservation storedReservation = reservation(10L, "confirmed");

        when(persistencePort.userExists(1L)).thenReturn(true);
        when(persistencePort.findSpaceCityId(2L)).thenReturn(Optional.of(3L));
        when(persistencePort.acquireSpaceReservationLock(2L, 5)).thenReturn(true);
        when(persistencePort.countOverlappingReservations(anyLong(), any(), any())).thenReturn(0);
        when(persistencePort.insertReservation(anyLong(), anyLong(), any(), any(), anyString(), any(), any(), any())).thenReturn(10L);
        when(persistencePort.findReservationById(10L)).thenReturn(Optional.of(storedReservation));
        when(persistencePort.findReservationEquipments(10L)).thenReturn(List.of());
        doThrow(new RuntimeException("rabbit down")).when(eventPublisherPort).publishReservationCreated(any());

        Reservation result = service.createReservation(cmd);

        assertEquals(10L, result.getId());
        verify(persistencePort).releaseSpaceReservationLock(2L);
    }

    @Test
    void listReservations_withFiltersAndEquipments() {
        Reservation reservation = reservation(20L, "confirmed");
        when(persistencePort.listReservations(1L, 2L, "confirmed")).thenReturn(List.of(reservation));
        when(persistencePort.findReservationEquipmentsByReservationIds(List.of(20L))).thenReturn(Map.of(
                20L,
                List.of(new ReservationEquipment(10L, 20L, 30L, "requested", null, null, null, null, null))
        ));

        List<Reservation> result = service.listReservations(new ListReservationsQuery(1L, 2L, " confirmed "));

        assertEquals(1, result.size());
        assertEquals(1, result.get(0).getEquipments().size());
    }

    @Test
    void listReservations_invalidStatus() {
        ApiException ex = assertThrows(ApiException.class,
                () -> service.listReservations(new ListReservationsQuery(null, null, "other")));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void getReservationById_notFound() {
        when(persistencePort.findReservationById(99L)).thenReturn(Optional.empty());

        ApiException ex = assertThrows(ApiException.class, () -> service.getReservationById(99L));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
    }

    @Test
    void cancelReservation_alreadyCancelled() {
        when(persistencePort.findReservationById(7L)).thenReturn(Optional.of(reservation(7L, "cancelled")));
        when(persistencePort.findReservationEquipments(7L)).thenReturn(List.of());

        ApiException ex = assertThrows(ApiException.class, () -> service.cancelReservation(7L, "x"));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void cancelReservation_successEvenWhenEventFails() {
        Reservation confirmed = reservation(7L, "confirmed");
        Reservation cancelled = new Reservation(
                7L, 1L, 2L,
                Instant.parse("2026-03-01T10:00:00Z"),
                Instant.parse("2026-03-01T12:00:00Z"),
                "cancelled", "Reserva", 2, null, "motivo",
                Instant.parse("2026-03-01T09:00:00Z"), List.of()
        );

        when(persistencePort.findReservationById(7L)).thenReturn(Optional.of(confirmed), Optional.of(cancelled));
        when(persistencePort.findReservationEquipments(7L)).thenReturn(List.of(), List.of());
        doThrow(new RuntimeException("event fail")).when(eventPublisherPort).publishReservationCancelled(any());

        Reservation result = service.cancelReservation(7L, "motivo");

        assertEquals("cancelled", result.getStatus());
        verify(persistencePort).updateReservationCancellation(7L, "cancelled", "motivo");
    }

    @Test
    void deliverReservation_invalidStatus() {
        when(persistencePort.findReservationById(7L)).thenReturn(Optional.of(reservation(7L, "completed")));
        when(persistencePort.findReservationEquipments(7L)).thenReturn(List.of());

        ApiException ex = assertThrows(ApiException.class,
                () -> service.deliverReservation(new HandoverReservationCommand(7L, 50L, "ok")));

        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
        assertEquals("INVALID_RESERVATION_STATUS", ex.getErrorCode());
    }

    @Test
    void deliverReservation_success() {
        Reservation existing = reservation(7L, "confirmed");
        Reservation delivered = reservation(7L, "in_progress");

        when(persistencePort.findReservationById(7L)).thenReturn(Optional.of(existing), Optional.of(delivered));
        when(persistencePort.findReservationEquipments(7L)).thenReturn(List.of(), List.of());

        Reservation result = service.deliverReservation(new HandoverReservationCommand(7L, 50L, "novedad"));

        assertEquals("in_progress", result.getStatus());
        verify(persistencePort).updateReservationStatus(7L, "in_progress");
        verify(persistencePort).markReservationEquipmentsDelivered(anyLong(), anyLong(), any(), anyString());
        verify(persistencePort).insertReservationHandoverLog(anyLong(), anyLong(), anyLong(), anyLong(), anyString(), anyString(), any());
    }

    @Test
    void returnReservation_success() {
        Reservation existing = reservation(9L, "in_progress");
        Reservation returned = reservation(9L, "completed");

        when(persistencePort.findReservationById(9L)).thenReturn(Optional.of(existing), Optional.of(returned));
        when(persistencePort.findReservationEquipments(9L)).thenReturn(List.of(), List.of());

        Reservation result = service.returnReservation(new HandoverReservationCommand(9L, 70L, "ok"));

        assertEquals("completed", result.getStatus());
        verify(persistencePort).updateReservationStatus(9L, "completed");
        verify(persistencePort).markReservationEquipmentsReturned(anyLong(), anyLong(), any(), anyString());
        verify(persistencePort).insertReservationHandoverLog(anyLong(), anyLong(), anyLong(), anyLong(), anyString(), anyString(), any());
    }

    private CreateReservationCommand baseCommand(List<Long> equipmentIds) {
        return new CreateReservationCommand(1L, 2L, "2026-03-01T10:00:00Z", "2026-03-01T12:00:00Z", "Reserva", 2, null, equipmentIds);
    }

    private Reservation reservation(long id, String status) {
        return new Reservation(
                id,
                1L,
                2L,
                Instant.parse("2026-03-01T10:00:00Z"),
                Instant.parse("2026-03-01T12:00:00Z"),
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
