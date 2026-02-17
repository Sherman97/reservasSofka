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
            const response = await this.httpClient.get('/spaces/listSpaces');

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
            const response = await this.httpClient.get(`/spaces/${id}`);

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
            const response = await this.httpClient.get('/spaces/listSpaces', {
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
}
