import type { Reservation } from '../../domain/entities/Reservation';

export interface BusySlot {
    start: string;
    end: string;
}

export interface AvailabilityResult {
    locationId: string;
    date: string;
    busySlots: BusySlot[];
}

/**
 * IReservationRepository - Port (Interface)
 * Defines the contract for reservation data access
 */
export interface IReservationRepository {
    create(reservationData: Record<string, unknown>): Promise<Reservation>;
    update(id: string, updateData: Record<string, unknown>): Promise<Reservation>;
    getByUserId(userId: string): Promise<Reservation[]>;
    getById(id: string): Promise<Reservation>;
    cancel(id: string): Promise<void>;
    deliver(id: string, novelty?: string): Promise<Reservation>;
    returnReservation(id: string, novelty?: string): Promise<Reservation>;
    getAvailability(locationId: string, date: string): Promise<AvailabilityResult>;
    /**
     * Checks in a reservation using a QR code token.
     * @param reservationId - The ID of the reservation to check in
     * @param qrToken - The JWT token from the scanned QR code
     * @returns Promise with the updated reservation
     * @throws InvalidQrCodeError if QR code is invalid
     * @throws QrExpiredError if check-in period has expired
     * @throws QrSpaceMismatchError if QR doesn't match reservation's space
     * @throws InvalidReservationStateError if reservation is not in PENDING state
     */
    checkIn(reservationId: string, qrToken: string): Promise<Reservation>;
}
