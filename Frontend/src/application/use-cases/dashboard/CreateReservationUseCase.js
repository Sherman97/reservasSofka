/**
 * CreateReservationUseCase - Application Use Case
 * Creates a new reservation with validation
 */
export class CreateReservationUseCase {
    constructor(reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    /**
     * Execute use case
     * @param {object} reservationData - Reservation data
     * @param {string|number} reservationData.locationId - Location ID
     * @param {string} reservationData.date - Date (YYYY-MM-DD)
     * @param {string} reservationData.startTime - Start time (HH:MM)
     * @param {string} reservationData.endTime - End time (HH:MM)
     * @param {Array} reservationData.equipment - Equipment IDs
     * @returns {Promise<Reservation>} Created reservation
     */
    async execute(reservationData) {
        // Validate required fields
        if (!reservationData.locationId) {
            throw new Error('Location ID is required');
        }

        if (!reservationData.date) {
            throw new Error('Date is required');
        }

        if (!reservationData.startTime || !reservationData.endTime) {
            throw new Error('Start time and end time are required');
        }

        // Validate time range
        const [startHour, startMinute] = reservationData.startTime.split(':').map(Number);
        const [endHour, endMinute] = reservationData.endTime.split(':').map(Number);

        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;

        if (endMinutes <= startMinutes) {
            throw new Error('End time must be after start time');
        }

        // Duration check (at least 30 minutes)
        const durationMinutes = endMinutes - startMinutes;
        if (durationMinutes < 30) {
            throw new Error('Reservation must be at least 30 minutes');
        }

        // Delegate to repository
        return await this.reservationRepository.create(reservationData);
    }
}
