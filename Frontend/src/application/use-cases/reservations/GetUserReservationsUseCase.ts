import type { IReservationRepository } from '../../../core/ports/repositories/IReservationRepository';
import type { Reservation } from '../../../core/domain/entities/Reservation';

export class GetUserReservationsUseCase {
    constructor(private readonly reservationRepository: IReservationRepository) {}

    async execute(userId: string): Promise<Reservation[]> {
        if (!userId) {
            throw new Error('User ID is required');
        }
        return await this.reservationRepository.getByUserId(userId);
    }
}
