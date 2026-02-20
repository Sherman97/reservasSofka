/**
 * GetSpaceAvailabilityUseCase - Application Use Case
 * Fetches busy time slots for a given space and date
 * Uses existing reservations endpoint to derive availability
 */
export class GetSpaceAvailabilityUseCase {
    constructor(reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    /**
     * Execute use case
     * @param {string|number} spaceId - Space/location ID
     * @param {string} date - Date string (YYYY-MM-DD)
     * @returns {Promise<{ busySlots: Array<{start: string, end: string}> }>}
     */
    async execute(spaceId, date) {
        if (!spaceId) {
            throw new Error('Space ID is required');
        }

        if (!date) {
            throw new Error('Date is required');
        }

        const result = await this.reservationRepository.getAvailability(spaceId, date);

        return {
            busySlots: result.busySlots || []
        };
    }
}
