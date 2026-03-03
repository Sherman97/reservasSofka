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
    getByUserId(userId: string): Promise<Reservation[]>;
    getById(id: string): Promise<Reservation>;
    cancel(id: string): Promise<void>;
    deliver(id: string, novelty?: string): Promise<Reservation>;
    returnReservation(id: string, novelty?: string): Promise<Reservation>;
    getAvailability(locationId: string, date: string): Promise<AvailabilityResult>;
}
