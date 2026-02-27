import type { IReservationRepository } from '../../../core/ports/repositories/IReservationRepository';

export class CancelReservationUseCase {
    constructor(private readonly reservationRepository: IReservationRepository) {}

    async execute(reservationId: string): Promise<void> {
        if (!reservationId) {
            throw new Error('Reservation ID is required');
        }
        await this.reservationRepository.cancel(reservationId);
    }
}
