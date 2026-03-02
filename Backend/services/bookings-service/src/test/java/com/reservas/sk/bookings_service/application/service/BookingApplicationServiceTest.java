package com.reservas.sk.bookings_service.application.service;

import com.reservas.sk.bookings_service.application.port.out.BookingPersistencePort;
import com.reservas.sk.bookings_service.application.port.out.ReservationEventPublisherPort;
import com.reservas.sk.bookings_service.application.usecase.*;
import com.reservas.sk.bookings_service.domain.model.Reservation;
import com.reservas.sk.bookings_service.domain.model.SpaceAvailability;
import com.reservas.sk.bookings_service.exception.ApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

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
    void createReservation_userNotFound() {
        CreateReservationCommand cmd = new CreateReservationCommand(1L, 2L, "2026-03-01T10:00:00Z", "2026-03-01T12:00:00Z", "Reserva", 2, null, List.of());
        when(persistencePort.userExists(1L)).thenReturn(false);
        ApiException ex = assertThrows(ApiException.class, () -> service.createReservation(cmd));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
    }

    @Test
    void createReservation_spaceNotFound() {
        CreateReservationCommand cmd = new CreateReservationCommand(1L, 2L, "2026-03-01T10:00:00Z", "2026-03-01T12:00:00Z", "Reserva", 2, null, List.of());
        when(persistencePort.userExists(1L)).thenReturn(true);
        when(persistencePort.findSpaceCityId(2L)).thenReturn(Optional.empty());
        ApiException ex = assertThrows(ApiException.class, () -> service.createReservation(cmd));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
    }

    @Test
    void createReservation_lockTimeout() {
        CreateReservationCommand cmd = new CreateReservationCommand(1L, 2L, "2026-03-01T10:00:00Z", "2026-03-01T12:00:00Z", "Reserva", 2, null, List.of());
        when(persistencePort.userExists(1L)).thenReturn(true);
        when(persistencePort.findSpaceCityId(2L)).thenReturn(Optional.of(3L));
        when(persistencePort.acquireSpaceReservationLock(2L, 5)).thenReturn(false);
        ApiException ex = assertThrows(ApiException.class, () -> service.createReservation(cmd));
        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
        assertEquals("SPACE_LOCK_TIMEOUT", ex.getErrorCode());
    }

    @Test
    void createReservation_exitoso_publicaEventoYLiberarLock() {
        CreateReservationCommand cmd = new CreateReservationCommand(1L, 2L, "2026-03-01T10:00:00Z", "2026-03-01T12:00:00Z", "Reserva", 2, null, List.of());
        when(persistencePort.userExists(1L)).thenReturn(true);
        when(persistencePort.findSpaceCityId(2L)).thenReturn(Optional.of(3L));
        when(persistencePort.acquireSpaceReservationLock(2L, 5)).thenReturn(true);
        when(persistencePort.countOverlappingReservations(anyLong(), any(), any())).thenReturn(0);
        when(persistencePort.insertReservation(anyLong(), anyLong(), any(), any(), anyString(), any(), any(), any())).thenReturn(10L);
        Reservation mockReservation = mock(Reservation.class);
        when(mockReservation.getId()).thenReturn(10L);
        when(mockReservation.getUserId()).thenReturn(1L);
        when(mockReservation.getSpaceId()).thenReturn(2L);
        when(mockReservation.getStatus()).thenReturn("confirmed");
        when(mockReservation.getStartDatetime()).thenReturn(java.time.Instant.parse("2026-03-01T10:00:00Z"));
        when(mockReservation.getEndDatetime()).thenReturn(java.time.Instant.parse("2026-03-01T12:00:00Z"));
        when(mockReservation.getEquipments()).thenReturn(List.of());
        when(mockReservation.getTitle()).thenReturn("Reserva");
        when(mockReservation.getAttendeesCount()).thenReturn(2);
        when(mockReservation.getNotes()).thenReturn(null);
        when(mockReservation.getCancellationReason()).thenReturn(null);
        when(mockReservation.getCreatedAt()).thenReturn(java.time.Instant.now());
        when(persistencePort.findReservationById(10L)).thenReturn(Optional.of(mockReservation));
        when(persistencePort.findReservationEquipments(10L)).thenReturn(List.of());
        doNothing().when(eventPublisherPort).publishReservationCreated(any(ReservationCreatedEvent.class));

        Reservation result = service.createReservation(cmd);
        assertNotNull(result);
        verify(eventPublisherPort, atLeastOnce()).publishReservationCreated(any(ReservationCreatedEvent.class));
        verify(persistencePort, atLeastOnce()).releaseSpaceReservationLock(2L);
    }

    @Test
    void createReservation_conflictoPorSolape() {
        CreateReservationCommand cmd = new CreateReservationCommand(1L, 2L, "2026-03-01T10:00:00Z", "2026-03-01T12:00:00Z", "Reserva", 2, null, List.of());
        when(persistencePort.userExists(1L)).thenReturn(true);
        when(persistencePort.findSpaceCityId(2L)).thenReturn(Optional.of(3L));
        when(persistencePort.acquireSpaceReservationLock(2L, 5)).thenReturn(true);
        when(persistencePort.countOverlappingReservations(anyLong(), any(), any())).thenReturn(1);
        ApiException ex = assertThrows(ApiException.class, () -> service.createReservation(cmd));
        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
        assertEquals("SPACE_ALREADY_RESERVED", ex.getErrorCode());
    }
}
