/**
 * CancelReservationUseCase - Application Use Case
 * Cancels an existing reservation
 */
export class CancelReservationUseCase {
    constructor(reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    /**
     * Execute use case
     * @param {string|number} reservationId - Reservation ID
     * @returns {Promise<void>}
     */
    async execute(reservationId) {
        if (!reservationId) {
            throw new Error('Reservation ID is required');
        }
        return await this.reservationRepository.cancel(reservationId);
    }
}
