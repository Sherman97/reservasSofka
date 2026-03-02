import type { ILocationRepository, LocationSearchCriteria } from '../../core/ports/repositories/ILocationRepository';
import type { IHttpClient } from '../../core/ports/services/IHttpClient';
import type { Location } from '../../core/domain/entities/Location';
import { LocationMapper } from '../mappers/LocationMapper';

interface ApiResponse<T = unknown> {
    ok: boolean;
    message?: string;
    data?: T;
}

/** Detect whether the API response uses { ok, data } wrapper or returns data directly */
function isWrappedResponse(raw: unknown): raw is ApiResponse {
    return typeof (raw as ApiResponse).ok === 'boolean';
}

export class HttpLocationRepository implements ILocationRepository {
    constructor(private readonly httpClient: IHttpClient) {}

    async getAll(): Promise<Location[]> {
        try {
            const response = await this.httpClient.get('/locations/spaces');
            const raw = response.data as ApiResponse<unknown[]> & Record<string, unknown>;

            if (isWrappedResponse(raw)) {
                if (!raw.ok) throw new Error(raw.message || 'Error fetching locations');
                return LocationMapper.toDomainList((raw.data || []) as Parameters<typeof LocationMapper.toDomainList>[0]);
            }

            // Direct array response
            const items = Array.isArray(raw) ? raw : [];
            return LocationMapper.toDomainList(items as Parameters<typeof LocationMapper.toDomainList>[0]);
        } catch (error) {
            console.error('Error in HttpLocationRepository.getAll:', error);
            throw error;
        }
    }

    async getById(id: string): Promise<Location> {
        try {
            const response = await this.httpClient.get(`/locations/spaces/${id}`);
            const raw = response.data as ApiResponse & Record<string, unknown>;

            if (isWrappedResponse(raw)) {
                if (!raw.ok) throw new Error(raw.message || 'Error fetching location');
                const location = LocationMapper.toDomain(raw.data as Parameters<typeof LocationMapper.toDomain>[0]);
                if (!location) throw new Error('Error mapping location data');
                return location;
            }

            // Direct object response
            const location = LocationMapper.toDomain(raw as Parameters<typeof LocationMapper.toDomain>[0]);
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
            const raw = response.data as ApiResponse<unknown[]> & Record<string, unknown>;

            if (isWrappedResponse(raw)) {
                if (!raw.ok) throw new Error(raw.message || 'Error searching locations');
                return LocationMapper.toDomainList((raw.data || []) as Parameters<typeof LocationMapper.toDomainList>[0]);
            }

            // Direct array response
            const items = Array.isArray(raw) ? raw : [];
            return LocationMapper.toDomainList(items as Parameters<typeof LocationMapper.toDomainList>[0]);
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
            const raw = response.data as ApiResponse & Record<string, unknown>;

            if (isWrappedResponse(raw)) {
                if (!raw.ok) throw new Error(raw.message || 'Error assigning inventory');
                return raw.data;
            }

            return raw;
        } catch (error) {
            console.error('Error in HttpLocationRepository.assignInventory:', error);
            throw error;
        }
    }

    async removeInventory(locationId: string, inventoryId: string): Promise<unknown> {
        try {
            const response = await this.httpClient.delete(`/locations/${locationId}/inventory/${inventoryId}`);
            const raw = response.data as ApiResponse & Record<string, unknown>;

            if (isWrappedResponse(raw)) {
                if (!raw.ok) throw new Error(raw.message || 'Error removing inventory');
                return raw.data;
            }

            return raw;
        } catch (error) {
            console.error('Error in HttpLocationRepository.removeInventory:', error);
            throw error;
        }
    }
}
