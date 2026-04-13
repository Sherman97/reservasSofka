import type { IReservationRepository } from '../../../core/ports/repositories/IReservationRepository';
import type { Reservation } from '../../../core/domain/entities/Reservation';

export class UpdateReservationTimeUseCase {
    constructor(private readonly reservationRepository: IReservationRepository) {}

    async execute(reservationId: string, date: string, startTime: string, endTime: string): Promise<Reservation> {
        if (!reservationId) {
            throw new Error('Reservation ID is required');
        }
        if (!date) {
            throw new Error('Reservation date is required');
        }
        if (!startTime || !endTime) {
            throw new Error('Start and end time are required');
        }
        if (startTime >= endTime) {
            throw new Error('End time must be later than start time');
        }
        if (!this.reservationRepository.updateTime) {
            throw new Error('Reservation update is not available');
        }
        return await this.reservationRepository.updateTime(reservationId, date, startTime, endTime);
    }
}

