/**
 * ILocationRepository - Port (Interface)
 * Defines the contract for location data access
 */
export class ILocationRepository {
    /**
     * Get all locations
     * @returns {Promise<Location[]>} List of locations
     */
    async getAll() {
        throw new Error('Method not implemented: getAll');
    }

    /**
     * Get location by ID
     * @param {string|number} id - Location ID
     * @returns {Promise<Location>} Location entity
     */
    async getById(id) {
        throw new Error('Method not implemented: getById');
    }

    /**
     * Search locations by criteria
     * @param {object} criteria - Search criteria
     * @returns {Promise<Location[]>} Filtered locations
     */
    async search(criteria) {
        throw new Error('Method not implemented: search');
    }
}
