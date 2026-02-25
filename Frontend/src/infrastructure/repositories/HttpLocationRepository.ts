import type { ILocationRepository, LocationSearchCriteria } from '../../core/ports/repositories/ILocationRepository';
import type { IHttpClient } from '../../core/ports/services/IHttpClient';
import type { Location } from '../../core/domain/entities/Location';
import { LocationMapper } from '../mappers/LocationMapper';

interface ApiResponse<T = unknown> {
    ok: boolean;
    message?: string;
    data?: T;
}

export class HttpLocationRepository implements ILocationRepository {
    constructor(private readonly httpClient: IHttpClient) {}

    async getAll(): Promise<Location[]> {
        try {
            const response = await this.httpClient.get('/locations/spaces');
            const data = response.data as ApiResponse<unknown[]>;

            if (!data.ok) throw new Error(data.message || 'Error fetching locations');
            return LocationMapper.toDomainList((data.data || []) as Parameters<typeof LocationMapper.toDomainList>[0]);
        } catch (error) {
            console.error('Error in HttpLocationRepository.getAll:', error);
            throw error;
        }
    }

    async getById(id: string): Promise<Location> {
        try {
            const response = await this.httpClient.get(`/locations/spaces/${id}`);
            const data = response.data as ApiResponse;

            if (!data.ok) throw new Error(data.message || 'Error fetching location');
            const location = LocationMapper.toDomain(data.data as Parameters<typeof LocationMapper.toDomain>[0]);
            if (!location) throw new Error('Error mapping location data');
            return location;
        } catch (error) {
            console.error('Error in HttpLocationRepository.getById:', error);
            throw error;
        }
    }

    async search(criteria: LocationSearchCriteria): Promise<Location[]> {
        try {
            const response = await this.httpClient.get('/locations/spaces', { params: criteria });
            const data = response.data as ApiResponse<unknown[]>;

            if (!data.ok) throw new Error(data.message || 'Error searching locations');
            return LocationMapper.toDomainList((data.data || []) as Parameters<typeof LocationMapper.toDomainList>[0]);
        } catch (error) {
            console.error('Error in HttpLocationRepository.search:', error);
            throw error;
        }
    }

    async assignInventory(locationId: string, inventoryId: string, qty: number): Promise<unknown> {
        try {
            const response = await this.httpClient.post(`/locations/${locationId}/inventory`, {
                inventoryId, qty
            });
            const data = response.data as ApiResponse;

            if (!data.ok) throw new Error(data.message || 'Error assigning inventory');
            return data.data;
        } catch (error) {
            console.error('Error in HttpLocationRepository.assignInventory:', error);
            throw error;
        }
    }

    async removeInventory(locationId: string, inventoryId: string): Promise<unknown> {
        try {
            const response = await this.httpClient.delete(`/locations/${locationId}/inventory/${inventoryId}`);
            const data = response.data as ApiResponse;

            if (!data.ok) throw new Error(data.message || 'Error removing inventory');
            return data.data;
        } catch (error) {
            console.error('Error in HttpLocationRepository.removeInventory:', error);
            throw error;
        }
    }
}
