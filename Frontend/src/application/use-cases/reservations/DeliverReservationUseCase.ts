import type { IReservationRepository } from '../../../core/ports/repositories/IReservationRepository';
import type { Reservation } from '../../../core/domain/entities/Reservation';

export class DeliverReservationUseCase {
    constructor(private readonly reservationRepository: IReservationRepository) {}

    async execute(reservationId: string, novelty?: string): Promise<Reservation> {
        if (!reservationId) {
            throw new Error('Reservation ID is required');
        }
        return await this.reservationRepository.deliver(reservationId, novelty);
    }
}
