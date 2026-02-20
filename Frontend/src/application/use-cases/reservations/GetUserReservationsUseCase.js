/**
 * GetUserReservationsUseCase - Application Use Case
 * Retrieves reservations for a specific user
 */
export class GetUserReservationsUseCase {
    constructor(reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    /**
     * Execute use case
     * @param {string|number} userId - User ID
     * @returns {Promise<Reservation[]>} User's reservations
     */
    async execute(userId) {
        if (!userId) {
            throw new Error('User ID is required');
        }
        return await this.reservationRepository.getByUserId(userId);
    }
}
