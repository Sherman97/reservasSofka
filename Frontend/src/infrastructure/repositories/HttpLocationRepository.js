import { ILocationRepository } from '../../core/ports/repositories/ILocationRepository';
import { LocationMapper } from '../mappers/LocationMapper';

/**
 * HttpLocationRepository - Repository Pattern implementation
 * Implements ILocationRepository using HTTP client
 */
export class HttpLocationRepository extends ILocationRepository {
    constructor(httpClient) {
        super();
        this.httpClient = httpClient;
    }

    async getAll() {
        try {
            const response = await this.httpClient.get('/locations/spaces');

            if (!response.data.ok) {
                throw new Error(response.data.message || 'Error fetching locations');
            }

            return LocationMapper.toDomainList(response.data.data || []);
        } catch (error) {
            console.error('Error in HttpLocationRepository.getAll:', error);
            throw error;
        }
    }

    async getById(id) {
        try {
            const response = await this.httpClient.get(`/locations/spaces/${id}`);

            if (!response.data.ok) {
                throw new Error(response.data.message || 'Error fetching location');
            }

            return LocationMapper.toDomain(response.data.data);
        } catch (error) {
            console.error('Error in HttpLocationRepository.getById:', error);
            throw error;
        }
    }

    async search(criteria) {
        try {
            const response = await this.httpClient.get('/locations/spaces', {
                params: criteria
            });

            if (!response.data.ok) {
                throw new Error(response.data.message || 'Error searching locations');
            }

            return LocationMapper.toDomainList(response.data.data || []);
        } catch (error) {
            console.error('Error in HttpLocationRepository.search:', error);
            throw error;
        }
    }

    async assignInventory(locationId, inventoryId, qty) {
        try {
            const response = await this.httpClient.post(`/locations/${locationId}/inventory`, {
                inventoryId,
                qty
            });

            if (!response.data.ok) {
                throw new Error(response.data.message || 'Error assigning inventory');
            }

            return response.data.data;
        } catch (error) {
            console.error('Error in HttpLocationRepository.assignInventory:', error);
            throw error;
        }
    }

    async removeInventory(locationId, inventoryId) {
        try {
            const response = await this.httpClient.delete(`/locations/${locationId}/inventory/${inventoryId}`);

            if (!response.data.ok) {
                throw new Error(response.data.message || 'Error removing inventory');
            }

            return response.data.data;
        } catch (error) {
            console.error('Error in HttpLocationRepository.removeInventory:', error);
            throw error;
        }
    }
}
