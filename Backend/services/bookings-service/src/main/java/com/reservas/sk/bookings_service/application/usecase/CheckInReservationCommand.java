package com.reservas.sk.bookings_service.application.usecase;

/**
 * Command to check in a reservation using a QR code token.
 * 
 * @param reservationId The ID of the reservation to check in
 * @param userId The ID of the user performing the check-in
 * @param qrToken The JWT token from the scanned QR code
 */
public record CheckInReservationCommand(Long reservationId,
                                         Long userId,
                                         String qrToken) {
}
