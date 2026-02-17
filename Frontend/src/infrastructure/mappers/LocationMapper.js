import { Location } from '../../core/domain/entities/Location';

/**
 * LocationMapper - Data Mapper Pattern
 * Converts between API DTOs and Location Domain Entities
 */
export class LocationMapper {
    /**
     * Convert API DTO to Domain Entity
     * @param {object} dto - Data Transfer Object from API
     * @returns {Location} Domain entity
     */
    static toDomain(dto) {
        if (!dto) {
            return null;
        }

        return new Location({
            id: dto.id || dto.spaceId,
            name: dto.name || dto.spaceName,
            description: dto.description || '',
            imageUrl: dto.image || dto.imageUrl || dto.imageURL || '',
            capacity: dto.capacity || dto.maxCapacity || 0,
            type: dto.type || 'sala',
            amenities: dto.tags || dto.amenities || []
        });
    }

    /**
     * Convert Domain Entity to API DTO
     * @param {Location} location - Domain entity
     * @returns {object} Data Transfer Object for API
     */
    static toDTO(location) {
        if (!location) {
            return null;
        }

        return {
            id: location.id,
            name: location.name,
            description: location.description,
            imageUrl: location.imageUrl,
            capacity: location.capacity,
            type: location.type,
            amenities: location.amenities
        };
    }

    /**
     * Convert array of DTOs to array of Domain Entities
     * @param {Array<object>} dtos - Array of DTOs
     * @returns {Array<Location>} Array of domain entities
     */
    static toDomainList(dtos) {
        if (!Array.isArray(dtos)) {
            return [];
        }
        return dtos.map(dto => this.toDomain(dto)).filter(Boolean);
    }
}
