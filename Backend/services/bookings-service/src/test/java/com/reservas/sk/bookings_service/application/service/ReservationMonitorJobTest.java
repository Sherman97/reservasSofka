package com.reservas.sk.bookings_service.application.service;

import com.reservas.sk.bookings_service.application.port.out.BookingPersistencePort;
import com.reservas.sk.bookings_service.application.port.out.ReservationEventPublisherPort;
import com.reservas.sk.bookings_service.application.usecase.ReservationNoShowEvent;
import com.reservas.sk.bookings_service.domain.model.Reservation;
import com.reservas.sk.bookings_service.infrastructure.config.QrProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservationMonitorJobTest {
    
    @Mock
    private BookingPersistencePort persistencePort;
    
    @Mock
    private ReservationEventPublisherPort eventPublisher;
    
    private ReservationMonitorJob job;
    private QrProperties qrProperties;
    
    @BeforeEach
    void setUp() {
        qrProperties = new QrProperties(5); // 5 minutes grace period
        job = new ReservationMonitorJob(persistencePort, eventPublisher, qrProperties);
    }
    
    @Test
    void shouldMarkExpiredReservationsAsNoShow_whenReservationsExpired() {
        // Arrange
        Instant now = Instant.now();
        Instant expiredStartTime = now.minus(10, ChronoUnit.MINUTES); // Started 10 min ago
        
        Reservation expiredReservation1 = new Reservation(
                1L, 100L, 50L,
                expiredStartTime,
                expiredStartTime.plus(1, ChronoUnit.HOURS),
                Reservation.STATUS_PENDING,
                "Meeting 1", 5, null, null,
                now.minus(1, ChronoUnit.HOURS),
                List.of(), null, null
        );
        
        Reservation expiredReservation2 = new Reservation(
                2L, 101L, 51L,
                expiredStartTime,
                expiredStartTime.plus(1, ChronoUnit.HOURS),
                Reservation.STATUS_PENDING,
                "Meeting 2", 3, null, null,
                now.minus(1, ChronoUnit.HOURS),
                List.of(), null, null
        );
        
        when(persistencePort.findExpiredPendingReservations(5))
                .thenReturn(List.of(expiredReservation1, expiredReservation2));
        when(persistencePort.updateReservationStatusBatch(anyList(), eq(Reservation.STATUS_NO_SHOW)))
                .thenReturn(2);
        
        // Act
        job.markExpiredReservationsAsNoShow();
        
        // Assert
        ArgumentCaptor<List<Long>> idsCaptor = ArgumentCaptor.forClass(List.class);
        verify(persistencePort).updateReservationStatusBatch(
                idsCaptor.capture(),
                eq(Reservation.STATUS_NO_SHOW)
        );
        
        List<Long> capturedIds = idsCaptor.getValue();
        assertEquals(2, capturedIds.size());
        assertTrue(capturedIds.contains(1L));
        assertTrue(capturedIds.contains(2L));
        
        // Verify events were published
        verify(eventPublisher, times(2)).publishReservationNoShow(any(ReservationNoShowEvent.class));
    }
    
    @Test
    void shouldPublishCorrectEventData_whenMarkingAsNoShow() {
        // Arrange
        Instant now = Instant.now();
        Instant startTime = now.minus(10, ChronoUnit.MINUTES);
        
        Reservation reservation = new Reservation(
                123L, 999L, 888L,
                startTime,
                startTime.plus(1, ChronoUnit.HOURS),
                Reservation.STATUS_PENDING,
                "Test Meeting", 5, null, null,
                now.minus(1, ChronoUnit.HOURS),
                List.of(), null, null
        );
        
        when(persistencePort.findExpiredPendingReservations(5))
                .thenReturn(List.of(reservation));
        when(persistencePort.updateReservationStatusBatch(anyList(), anyString()))
                .thenReturn(1);
        
        // Act
        job.markExpiredReservationsAsNoShow();
        
        // Assert
        ArgumentCaptor<ReservationNoShowEvent> eventCaptor = ArgumentCaptor.forClass(ReservationNoShowEvent.class);
        verify(eventPublisher).publishReservationNoShow(eventCaptor.capture());
        
        ReservationNoShowEvent event = eventCaptor.getValue();
        assertEquals(123L, event.reservationId());
        assertEquals(999L, event.userId());
        assertEquals(888L, event.spaceId());
        assertEquals(startTime, event.startDatetime());
        assertNotNull(event.occurredAt());
    }
    
    @Test
    void shouldDoNothing_whenNoExpiredReservations() {
        // Arrange
        when(persistencePort.findExpiredPendingReservations(5))
                .thenReturn(List.of());
        
        // Act
        job.markExpiredReservationsAsNoShow();
        
        // Assert
        verify(persistencePort, never()).updateReservationStatusBatch(anyList(), anyString());
        verify(eventPublisher, never()).publishReservationNoShow(any());
    }
    
    @Test
    void shouldHandleRaceCondition_whenNoReservationsUpdated() {
        // Arrange
        Instant now = Instant.now();
        Reservation reservation = new Reservation(
                1L, 100L, 50L,
                now.minus(10, ChronoUnit.MINUTES),
                now.plus(50, ChronoUnit.MINUTES),
                Reservation.STATUS_PENDING,
                "Meeting", 5, null, null,
                now.minus(1, ChronoUnit.HOURS),
                List.of(), null, null
        );
        
        when(persistencePort.findExpiredPendingReservations(5))
                .thenReturn(List.of(reservation));
        when(persistencePort.updateReservationStatusBatch(anyList(), anyString()))
                .thenReturn(0); // Race condition: already updated by another process
        
        // Act
        job.markExpiredReservationsAsNoShow();
        
        // Assert
        verify(eventPublisher, never()).publishReservationNoShow(any());
    }
    
    @Test
    void shouldContinueProcessing_whenEventPublishingFails() {
        // Arrange
        Instant now = Instant.now();
        Instant startTime = now.minus(10, ChronoUnit.MINUTES);
        
        Reservation reservation1 = new Reservation(
                1L, 100L, 50L, startTime,
                startTime.plus(1, ChronoUnit.HOURS),
                Reservation.STATUS_PENDING,
                "Meeting 1", 5, null, null,
                now.minus(1, ChronoUnit.HOURS),
                List.of(), null, null
        );
        
        Reservation reservation2 = new Reservation(
                2L, 101L, 51L, startTime,
                startTime.plus(1, ChronoUnit.HOURS),
                Reservation.STATUS_PENDING,
                "Meeting 2", 3, null, null,
                now.minus(1, ChronoUnit.HOURS),
                List.of(), null, null
        );
        
        when(persistencePort.findExpiredPendingReservations(5))
                .thenReturn(List.of(reservation1, reservation2));
        when(persistencePort.updateReservationStatusBatch(anyList(), anyString()))
                .thenReturn(2);
        
        // First event fails, second should still be attempted
        doThrow(new RuntimeException("RabbitMQ error"))
                .doNothing()
                .when(eventPublisher).publishReservationNoShow(any(ReservationNoShowEvent.class));
        
        // Act
        job.markExpiredReservationsAsNoShow();
        
        // Assert
        verify(eventPublisher, times(2)).publishReservationNoShow(any(ReservationNoShowEvent.class));
    }
    
    @Test
    void shouldNotRethrowException_whenJobFails() {
        // Arrange
        when(persistencePort.findExpiredPendingReservations(5))
                .thenThrow(new RuntimeException("Database connection error"));
        
        // Act & Assert - should not throw
        assertDoesNotThrow(() -> job.markExpiredReservationsAsNoShow());
    }
    
    @Test
    void shouldUseConfiguredGracePeriod_whenFindingExpiredReservations() {
        // Arrange
        when(persistencePort.findExpiredPendingReservations(5))
                .thenReturn(List.of());
        
        // Act
        job.markExpiredReservationsAsNoShow();
        
        // Assert
        verify(persistencePort).findExpiredPendingReservations(5);
        assertEquals(5, job.getGracePeriodMinutes());
    }
    
    @Test
    void shouldBeIdempotent_whenCalledMultipleTimes() {
        // Arrange
        Instant now = Instant.now();
        Reservation reservation = new Reservation(
                1L, 100L, 50L,
                now.minus(10, ChronoUnit.MINUTES),
                now.plus(50, ChronoUnit.MINUTES),
                Reservation.STATUS_PENDING,
                "Meeting", 5, null, null,
                now.minus(1, ChronoUnit.HOURS),
                List.of(), null, null
        );
        
        // First call finds reservation, second call finds nothing (already processed)
        when(persistencePort.findExpiredPendingReservations(5))
                .thenReturn(List.of(reservation))
                .thenReturn(List.of());
        when(persistencePort.updateReservationStatusBatch(anyList(), anyString()))
                .thenReturn(1);
        
        // Act
        job.markExpiredReservationsAsNoShow(); // First execution
        job.markExpiredReservationsAsNoShow(); // Second execution
        
        // Assert
        verify(persistencePort, times(2)).findExpiredPendingReservations(5);
        verify(persistencePort, times(1)).updateReservationStatusBatch(anyList(), anyString());
        verify(eventPublisher, times(1)).publishReservationNoShow(any());
    }
}
