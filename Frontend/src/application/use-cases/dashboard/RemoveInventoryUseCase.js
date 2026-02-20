/**
 * RemoveInventoryUseCase - Application Use Case
 * Removes an inventory item from a location
 */
export class RemoveInventoryUseCase {
    constructor(locationRepository) {
        this.locationRepository = locationRepository;
    }

    /**
     * Execute use case
     * @param {object} params
     * @param {string|number} params.locationId - Location ID
     * @param {string|number} params.inventoryId - Inventory Item ID
     * @returns {Promise<any>}
     */
    async execute({ locationId, inventoryId }) {
        if (!locationId) throw new Error('Location ID is required');
        if (!inventoryId) throw new Error('Inventory ID is required');

        return await this.locationRepository.removeInventory(locationId, inventoryId);
    }
}
