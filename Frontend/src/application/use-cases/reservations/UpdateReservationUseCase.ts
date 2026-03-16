import type { IReservationRepository } from '../../../core/ports/repositories/IReservationRepository';
import type { Reservation } from '../../../core/domain/entities/Reservation';

export class UpdateReservationUseCase {
    constructor(private readonly reservationRepository: IReservationRepository) {}

    async execute(id: string, updateData: Record<string, unknown>): Promise<Reservation> {
        if (!id) {
            throw new Error('Reservation ID is required');
        }

        if (!updateData || Object.keys(updateData).length === 0) {
            throw new Error('Update data cannot be empty');
        }

        // We delegate the validation logic to the backend and the domain/mapper where appropriate,
        // but we can add minor pre-checks if necessary. The repository calls the backend.
        return this.reservationRepository.update(id, updateData);
    }
}
