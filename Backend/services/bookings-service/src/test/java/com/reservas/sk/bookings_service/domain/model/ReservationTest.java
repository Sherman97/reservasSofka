package com.reservas.sk.bookings_service.domain.model;

import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ReservationTest {
    
    @Test
    void shouldAllowCheckIn_whenStatusPendingAndWithinGracePeriod() {
        // Arrange
        Instant startTime = Instant.now();
        Instant currentTime = startTime.plus(3, ChronoUnit.MINUTES); // 3 min after start
        Reservation reservation = createReservation(Reservation.STATUS_PENDING, startTime);
        
        // Act
        boolean canCheckIn = reservation.canCheckIn(currentTime, 5);
        
        // Assert
        assertTrue(canCheckIn);
    }
    
    @Test
    void shouldNotAllowCheckIn_whenStatusNotPending() {
        // Arrange
        Instant startTime = Instant.now();
        Instant currentTime = startTime.plus(2, ChronoUnit.MINUTES);
        Reservation reservation = createReservation(Reservation.STATUS_CHECKED_IN, startTime);
        
        // Act
        boolean canCheckIn = reservation.canCheckIn(currentTime, 5);
        
        // Assert
        assertFalse(canCheckIn);
    }
    
    @Test
    void shouldNotAllowCheckIn_whenCurrentTimeBeforeStart() {
        // Arrange
        Instant startTime = Instant.now().plus(10, ChronoUnit.MINUTES);
        Instant currentTime = Instant.now();
        Reservation reservation = createReservation(Reservation.STATUS_PENDING, startTime);
        
        // Act
        boolean canCheckIn = reservation.canCheckIn(currentTime, 5);
        
        // Assert
        assertFalse(canCheckIn);
    }
    
    @Test
    void shouldNotAllowCheckIn_whenOutsideGracePeriod() {
        // Arrange
        Instant startTime = Instant.now();
        Instant currentTime = startTime.plus(10, ChronoUnit.MINUTES); // 10 min after start
        Reservation reservation = createReservation(Reservation.STATUS_PENDING, startTime);
        
        // Act
        boolean canCheckIn = reservation.canCheckIn(currentTime, 5);
        
        // Assert
        assertFalse(canCheckIn);
    }
    
    @Test
    void shouldAllowCheckIn_whenExactlyAtStartTime() {
        // Arrange
        Instant startTime = Instant.now();
        Instant currentTime = startTime;
        Reservation reservation = createReservation(Reservation.STATUS_PENDING, startTime);
        
        // Act
        boolean canCheckIn = reservation.canCheckIn(currentTime, 5);
        
        // Assert
        assertTrue(canCheckIn);
    }
    
    @Test
    void shouldAllowCheckIn_whenExactlyAtGracePeriodDeadline() {
        // Arrange
        Instant startTime = Instant.now();
        Instant currentTime = startTime.plus(5, ChronoUnit.MINUTES); // Exactly 5 min
        Reservation reservation = createReservation(Reservation.STATUS_PENDING, startTime);
        
        // Act
        boolean canCheckIn = reservation.canCheckIn(currentTime, 5);
        
        // Assert
        assertTrue(canCheckIn);
    }
    
    @Test
    void shouldNotAllowCheckIn_whenStatusCanceled() {
        // Arrange
        Instant startTime = Instant.now();
        Instant currentTime = startTime.plus(2, ChronoUnit.MINUTES);
        Reservation reservation = createReservation(Reservation.STATUS_CANCELED, startTime);
        
        // Act
        boolean canCheckIn = reservation.canCheckIn(currentTime, 5);
        
        // Assert
        assertFalse(canCheckIn);
    }
    
    @Test
    void shouldNotAllowCheckIn_whenStatusNoShow() {
        // Arrange
        Instant startTime = Instant.now();
        Instant currentTime = startTime.plus(2, ChronoUnit.MINUTES);
        Reservation reservation = createReservation(Reservation.STATUS_NO_SHOW, startTime);
        
        // Act
        boolean canCheckIn = reservation.canCheckIn(currentTime, 5);
        
        // Assert
        assertFalse(canCheckIn);
    }
    
    @Test
    void shouldCreateCheckedInReservation_whenCheckInCalled() {
        // Arrange
        Instant startTime = Instant.now();
        Instant checkedInTime = Instant.now().plus(2, ChronoUnit.MINUTES);
        Reservation reservation = createReservation(Reservation.STATUS_PENDING, startTime);
        
        // Act
        Reservation checkedIn = reservation.checkIn(checkedInTime);
        
        // Assert
        assertEquals(Reservation.STATUS_CHECKED_IN, checkedIn.getStatus());
        assertEquals(checkedInTime, checkedIn.getCheckedInAt());
        assertEquals(reservation.getId(), checkedIn.getId());
        assertEquals(reservation.getUserId(), checkedIn.getUserId());
        assertEquals(reservation.getSpaceId(), checkedIn.getSpaceId());
    }
    
    @Test
    void shouldPreserveAllFields_whenCheckInCalled() {
        // Arrange
        Instant startTime = Instant.now();
        Instant checkedInTime = Instant.now().plus(2, ChronoUnit.MINUTES);
        Reservation original = new Reservation(
            1L, 100L, 200L, startTime, startTime.plus(1, ChronoUnit.HOURS),
            Reservation.STATUS_PENDING, "Test Meeting", 5, "Important",
            null, Instant.now(), List.of(), "test-token", null
        );
        
        // Act
        Reservation checkedIn = original.checkIn(checkedInTime);
        
        // Assert
        assertEquals(original.getTitle(), checkedIn.getTitle());
        assertEquals(original.getAttendeesCount(), checkedIn.getAttendeesCount());
        assertEquals(original.getNotes(), checkedIn.getNotes());
        assertEquals(original.getQrToken(), checkedIn.getQrToken());
    }
    
    private Reservation createReservation(String status, Instant startTime) {
        return new Reservation(
            1L,
            100L,
            200L,
            startTime,
            startTime.plus(1, ChronoUnit.HOURS),
            status,
            "Test Meeting",
            5,
            "Test notes",
            null,
            Instant.now(),
            List.of(),
            null,
            null
        );
    }
}
