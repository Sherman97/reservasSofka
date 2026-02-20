/**
 * AssignInventoryUseCase - Application Use Case
 * Assigns an inventory item to a location with a specific quantity
 */
export class AssignInventoryUseCase {
    constructor(locationRepository) {
        this.locationRepository = locationRepository;
    }

    /**
     * Execute use case
     * @param {object} params
     * @param {string|number} params.locationId - Location ID
     * @param {string|number} params.inventoryId - Inventory Item ID
     * @param {number} params.qty - Quantity to assign
     * @returns {Promise<any>}
     */
    async execute({ locationId, inventoryId, qty }) {
        if (!locationId) throw new Error('Location ID is required');
        if (!inventoryId) throw new Error('Inventory ID is required');
        if (!qty || qty < 1) throw new Error('Valid quantity is required');

        return await this.locationRepository.assignInventory(locationId, inventoryId, qty);
    }
}
