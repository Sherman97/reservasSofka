import type { IInventoryRepository, InventorySearchCriteria } from '../../core/ports/repositories/IInventoryRepository';
import type { IHttpClient } from '../../core/ports/services/IHttpClient';
import type { InventoryItem } from '../../core/domain/entities/InventoryItem';
import { InventoryMapper } from '../mappers/InventoryMapper';

interface ApiResponse<T = unknown> {
    ok: boolean;
    message?: string;
    data?: T;
}

export class HttpInventoryRepository implements IInventoryRepository {
    constructor(private readonly httpClient: IHttpClient) {}

    async getAll(): Promise<InventoryItem[]> {
        try {
            const response = await this.httpClient.get('/inventory/equipments');
            const data = response.data as ApiResponse<unknown[]>;

            if (!data.ok) throw new Error(data.message || 'Error fetching inventory');
            return InventoryMapper.toDomainList((data.data || []) as Parameters<typeof InventoryMapper.toDomainList>[0]);
        } catch (error) {
            console.error('Error in HttpInventoryRepository.getAll:', error);
            throw error;
        }
    }

    async getById(id: string): Promise<InventoryItem> {
        try {
            const response = await this.httpClient.get(`/inventory/equipments/${id}`);
            const data = response.data as ApiResponse;

            if (!data.ok) throw new Error(data.message || 'Error fetching inventory item');
            const item = InventoryMapper.toDomain(data.data as Parameters<typeof InventoryMapper.toDomain>[0]);
            if (!item) throw new Error('Error mapping inventory data');
            return item;
        } catch (error) {
            console.error('Error in HttpInventoryRepository.getById:', error);
            throw error;
        }
    }

    async getByCityId(cityId: string): Promise<InventoryItem[]> {
        try {
            const response = await this.httpClient.get('/inventory/equipments', {
                params: { cityId }
            });
            const data = response.data as ApiResponse<unknown[]>;

            if (!data.ok) throw new Error(data.message || 'Error fetching inventory by city');
            return InventoryMapper.toDomainList((data.data || []) as Parameters<typeof InventoryMapper.toDomainList>[0]);
        } catch (error) {
            console.error('Error in HttpInventoryRepository.getByCityId:', error);
            throw error;
        }
    }

    async search(criteria: InventorySearchCriteria): Promise<InventoryItem[]> {
        try {
            const response = await this.httpClient.get('/inventory/equipments', { params: criteria });
            const data = response.data as ApiResponse<unknown[]>;

            if (!data.ok) throw new Error(data.message || 'Error searching inventory');
            return InventoryMapper.toDomainList((data.data || []) as Parameters<typeof InventoryMapper.toDomainList>[0]);
        } catch (error) {
            console.error('Error in HttpInventoryRepository.search:', error);
            throw error;
        }
    }
}
