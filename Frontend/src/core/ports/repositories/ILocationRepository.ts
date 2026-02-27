import type { Location } from '../../domain/entities/Location';

export interface LocationSearchCriteria {
    type?: string;
    cityId?: string;
    [key: string]: unknown;
}

/**
 * ILocationRepository - Port (Interface)
 * Defines the contract for location/space data access
 */
export interface ILocationRepository {
    getAll(): Promise<Location[]>;
    getById(id: string): Promise<Location>;
    search(criteria: LocationSearchCriteria): Promise<Location[]>;
    assignInventory(locationId: string, inventoryId: string, qty: number): Promise<unknown>;
    removeInventory(locationId: string, inventoryId: string): Promise<unknown>;
}
