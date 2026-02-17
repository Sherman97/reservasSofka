import { IInventoryRepository } from '../../core/ports/repositories/IInventoryRepository';
import { InventoryMapper } from '../mappers/InventoryMapper';

/**
 * HttpInventoryRepository - Repository Pattern implementation
 * Implements IInventoryRepository using HTTP client
 */
export class HttpInventoryRepository extends IInventoryRepository {
    constructor(httpClient) {
        super();
        this.httpClient = httpClient;
    }

    async getAll() {
        try {
            const response = await this.httpClient.get('/items/listItems');

            if (!response.data.ok) {
                throw new Error(response.data.message || 'Error fetching inventory');
            }

            return InventoryMapper.toDomainList(response.data.data || []);
        } catch (error) {
            console.error('Error in HttpInventoryRepository.getAll:', error);
            throw error;
        }
    }

    async getById(id) {
        try {
            const response = await this.httpClient.get(`/items/${id}`);

            if (!response.data.ok) {
                throw new Error(response.data.message || 'Error fetching inventory item');
            }

            return InventoryMapper.toDomain(response.data.data);
        } catch (error) {
            console.error('Error in HttpInventoryRepository.getById:', error);
            throw error;
        }
    }

    async getByCityId(cityId) {
        try {
            const response = await this.httpClient.get('/items/listItems', {
                params: { city_id: cityId }
            });

            if (!response.data.ok) {
                throw new Error(response.data.message || 'Error fetching inventory by city');
            }

            return InventoryMapper.toDomainList(response.data.data || []);
        } catch (error) {
            console.error('Error in HttpInventoryRepository.getByCityId:', error);
            throw error;
        }
    }

    async search(criteria) {
        try {
            const response = await this.httpClient.get('/items/listItems', {
                params: criteria
            });

            if (!response.data.ok) {
                throw new Error(response.data.message || 'Error searching inventory');
            }

            return InventoryMapper.toDomainList(response.data.data || []);
        } catch (error) {
            console.error('Error in HttpInventoryRepository.search:', error);
            throw error;
        }
    }
}
