import type { IInventoryRepository } from '../../../core/ports/repositories/IInventoryRepository';
import type { InventoryItem } from '../../../core/domain/entities/InventoryItem';

interface GetInventoryParams {
    cityId?: string;
}

export class GetInventoryUseCase {
    constructor(private readonly inventoryRepository: IInventoryRepository) {}

    async execute({ cityId }: GetInventoryParams = {}): Promise<InventoryItem[]> {
        if (cityId) {
            return await this.inventoryRepository.getByCityId(cityId);
        }
        return await this.inventoryRepository.getAll();
    }
}
