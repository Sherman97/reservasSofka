import type { ILocationRepository } from '../../../core/ports/repositories/ILocationRepository';

interface AssignInventoryParams {
    locationId: string;
    inventoryId: string;
    qty: number;
}

export class AssignInventoryUseCase {
    constructor(private readonly locationRepository: ILocationRepository) {}

    async execute({ locationId, inventoryId, qty }: AssignInventoryParams): Promise<unknown> {
        if (!locationId) throw new Error('Location ID is required');
        if (!inventoryId) throw new Error('Inventory ID is required');
        if (!qty || qty < 1) throw new Error('Valid quantity is required');

        return await this.locationRepository.assignInventory(locationId, inventoryId, qty);
    }
}
