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
     * @param {string|number} _id - Location ID
     * @returns {Promise<Location>} Location entity
     */
    async getById(_id) {
        throw new Error('Method not implemented: getById');
    }

    /**
     * Search locations by criteria
     * @param {object} _criteria - Search criteria
     * @returns {Promise<Location[]>} Filtered locations
     */
    async search(_criteria) {
        throw new Error('Method not implemented: search');
    }

    /**
     * Assign inventory to location
     * @param {string|number} _locationId 
     * @param {string|number} _inventoryId 
     * @param {number} _qty 
     * @returns {Promise<any>}
     */
    async assignInventory(_locationId, _inventoryId, _qty) {
        throw new Error('Method not implemented: assignInventory');
    }

    /**
     * Remove inventory from location
     * @param {string|number} _locationId 
     * @param {string|number} _inventoryId 
     * @returns {Promise<any>}
     */
    async removeInventory(_locationId, _inventoryId) {
        throw new Error('Method not implemented: removeInventory');
    }
}
