/**
 * IInventoryRepository - Port (Interface)
 * Defines the contract for inventory data access
 */
export class IInventoryRepository {
    /**
     * Get all inventory items
     * @returns {Promise<InventoryItem[]>} List of inventory items
     */
    async getAll() {
        throw new Error('Method not implemented: getAll');
    }

    /**
     * Get inventory item by ID
     * @param {string|number} id - Item ID
     * @returns {Promise<InventoryItem>} Inventory item entity
     */
    async getById(_id) {
        throw new Error('Method not implemented: getById');
    }

    /**
     * Get inventory items by city
     * @param {string|number} cityId - City ID
     * @returns {Promise<InventoryItem[]>} Filtered inventory items
     */
    async getByCityId(_cityId) {
        throw new Error('Method not implemented: getByCityId');
    }

    /**
     * Search inventory by criteria
     * @param {object} criteria - Search criteria
     * @returns {Promise<InventoryItem[]>} Filtered inventory items
     */
    async search(_criteria) {
        throw new Error('Method not implemented: search');
    }
}
