/**
 * GetInventoryUseCase - Application Use Case
 * Retrieves inventory items with optional filtering
 */
export class GetInventoryUseCase {
    constructor(inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    /**
     * Execute use case
     * @param {object} params - Parameters
     * @param {string|number} params.cityId - Optional city ID filter
     * @returns {Promise<InventoryItem[]>} List of inventory items
     */
    async execute({ cityId } = {}) {
        if (cityId) {
            return await this.inventoryRepository.getByCityId(cityId);
        }

        return await this.inventoryRepository.getAll();
    }
}
