import type { InventoryItem } from '../../domain/entities/InventoryItem';

export interface InventorySearchCriteria {
    cityId?: string;
    category?: string;
    [key: string]: unknown;
}

/**
 * IInventoryRepository - Port (Interface)
 * Defines the contract for inventory data access
 */
export interface IInventoryRepository {
    getAll(): Promise<InventoryItem[]>;
    getById(id: string): Promise<InventoryItem>;
    getByCityId(cityId: string): Promise<InventoryItem[]>;
    search(criteria: InventorySearchCriteria): Promise<InventoryItem[]>;
}
