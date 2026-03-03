import type { IReservationRepository } from '../../../core/ports/repositories/IReservationRepository';
import type { Reservation } from '../../../core/domain/entities/Reservation';

export interface CreateReservationData {
    locationId: string;
    date: string;
    startTime: string;
    endTime: string;
    [key: string]: unknown;
}

export class CreateReservationUseCase {
    constructor(private readonly reservationRepository: IReservationRepository) {}

    async execute(reservationData: CreateReservationData): Promise<Reservation> {
        if (!reservationData.locationId) {
            throw new Error('Location ID is required');
        }
        if (!reservationData.date) {
            throw new Error('Date is required');
        }
        if (!reservationData.startTime || !reservationData.endTime) {
            throw new Error('Start time and end time are required');
        }

        const [startHour, startMinute] = reservationData.startTime.split(':').map(Number);
        const [endHour, endMinute] = reservationData.endTime.split(':').map(Number);

        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;

        if (endMinutes <= startMinutes) {
            throw new Error('End time must be after start time');
        }

        return await this.reservationRepository.create(reservationData as unknown as Record<string, unknown>);
    }
}
