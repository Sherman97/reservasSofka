import type { IInventoryRepository, InventorySearchCriteria } from '../../core/ports/repositories/IInventoryRepository';
import type { IHttpClient } from '../../core/ports/services/IHttpClient';
import type { InventoryItem } from '../../core/domain/entities/InventoryItem';
import { InventoryMapper } from '../mappers/InventoryMapper';

interface ApiResponse<T = unknown> {
    ok: boolean;
    message?: string;
    data?: T;
}

/** Detect whether the API response uses { ok, data } wrapper or returns data directly */
function isWrappedResponse(raw: unknown): raw is ApiResponse {
    return typeof (raw as ApiResponse).ok === 'boolean';
}

export class HttpInventoryRepository implements IInventoryRepository {
    constructor(private readonly httpClient: IHttpClient) {}

    async getAll(): Promise<InventoryItem[]> {
        try {
            const response = await this.httpClient.get('/inventory/equipments');
            const raw = response.data as ApiResponse<unknown[]> & Record<string, unknown>;

            if (isWrappedResponse(raw)) {
                if (!raw.ok) throw new Error(raw.message || 'Error fetching inventory');
                return InventoryMapper.toDomainList((raw.data || []) as Parameters<typeof InventoryMapper.toDomainList>[0]);
            }

            // Direct array response
            const items = Array.isArray(raw) ? raw : [];
            return InventoryMapper.toDomainList(items as Parameters<typeof InventoryMapper.toDomainList>[0]);
        } catch (error) {
            console.error('Error in HttpInventoryRepository.getAll:', error);
            throw error;
        }
    }

    async getById(id: string): Promise<InventoryItem> {
        try {
            const response = await this.httpClient.get(`/inventory/equipments/${id}`);
            const raw = response.data as ApiResponse & Record<string, unknown>;

            if (isWrappedResponse(raw)) {
                if (!raw.ok) throw new Error(raw.message || 'Error fetching inventory item');
                const item = InventoryMapper.toDomain(raw.data as Parameters<typeof InventoryMapper.toDomain>[0]);
                if (!item) throw new Error('Error mapping inventory data');
                return item;
            }

            // Direct object response
            const item = InventoryMapper.toDomain(raw as Parameters<typeof InventoryMapper.toDomain>[0]);
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
            const raw = response.data as ApiResponse<unknown[]> & Record<string, unknown>;

            if (isWrappedResponse(raw)) {
                if (!raw.ok) throw new Error(raw.message || 'Error fetching inventory by city');
                return InventoryMapper.toDomainList((raw.data || []) as Parameters<typeof InventoryMapper.toDomainList>[0]);
            }

            // Direct array response
            const items = Array.isArray(raw) ? raw : [];
            return InventoryMapper.toDomainList(items as Parameters<typeof InventoryMapper.toDomainList>[0]);
        } catch (error) {
            console.error('Error in HttpInventoryRepository.getByCityId:', error);
            throw error;
        }
    }

    async search(criteria: InventorySearchCriteria): Promise<InventoryItem[]> {
        try {
            const response = await this.httpClient.get('/inventory/equipments', { params: criteria });
            const raw = response.data as ApiResponse<unknown[]> & Record<string, unknown>;

            if (isWrappedResponse(raw)) {
                if (!raw.ok) throw new Error(raw.message || 'Error searching inventory');
                return InventoryMapper.toDomainList((raw.data || []) as Parameters<typeof InventoryMapper.toDomainList>[0]);
            }

            // Direct array response
            const items = Array.isArray(raw) ? raw : [];
            return InventoryMapper.toDomainList(items as Parameters<typeof InventoryMapper.toDomainList>[0]);
        } catch (error) {
            console.error('Error in HttpInventoryRepository.search:', error);
            throw error;
        }
    }
}
