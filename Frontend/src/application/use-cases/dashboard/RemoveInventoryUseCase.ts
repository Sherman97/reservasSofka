import type { ILocationRepository } from '../../../core/ports/repositories/ILocationRepository';

interface RemoveInventoryParams {
    locationId: string;
    inventoryId: string;
}

export class RemoveInventoryUseCase {
    constructor(private readonly locationRepository: ILocationRepository) {}

    async execute({ locationId, inventoryId }: RemoveInventoryParams): Promise<unknown> {
        if (!locationId) throw new Error('Location ID is required');
        if (!inventoryId) throw new Error('Inventory ID is required');

        return await this.locationRepository.removeInventory(locationId, inventoryId);
    }
}
