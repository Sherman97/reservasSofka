/**
 * IReservationRepository - Port (Interface)
 * Defines the contract for reservation data access
 */
export class IReservationRepository {
    /**
     * Create a new reservation
     * @param {object} reservationData - Reservation data
     * @returns {Promise<Reservation>} Created reservation
     */
    async create(_reservationData) {
        throw new Error('Method not implemented: create');
    }

    /**
     * Get reservations by user ID
     * @param {string|number} userId - User ID
     * @returns {Promise<Reservation[]>} User's reservations
     */
    async getByUserId(_userId) {
        throw new Error('Method not implemented: getByUserId');
    }

    /**
     * Get reservation by ID
     * @param {string|number} id - Reservation ID
     * @returns {Promise<Reservation>} Reservation entity
     */
    async getById(_id) {
        throw new Error('Method not implemented: getById');
    }

    /**
     * Cancel a reservation
     * @param {string|number} id - Reservation ID
     * @returns {Promise<void>}
     */
    async cancel(_id) {
        throw new Error('Method not implemented: cancel');
    }

    /**
     * Get availability for location and date
     * @param {string|number} locationId - Location ID
     * @param {Date} date - Date to check
     * @returns {Promise<object>} Availability info
     */
    async getAvailability(_locationId, _date) {
        throw new Error('Method not implemented: getAvailability');
    }
}
