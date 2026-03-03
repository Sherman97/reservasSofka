import { User } from '../../core/domain/entities/User';

/**
 * UserMapper - Data Mapper Pattern
 * Converts between API DTOs and Domain Entities
 * Centralizes all data transformation logic
 */
export class UserMapper {
    /**
     * Convert API DTO to Domain Entity
     * @param {object} dto - Data Transfer Object from API
     * @returns {User} Domain entity
     */
    static toDomain(dto) {
        if (!dto) {
            return null;
        }

        return new User({
            id: dto.id,
            email: dto.email,
            name: dto.name || dto.username || dto.fullName,
            role: dto.role || 'user'
        });
    }

    /**
     * Convert Domain Entity to API DTO
     * @param {User} user - Domain entity
     * @returns {object} Data Transfer Object for API
     */
    static toDTO(user) {
        if (!user) {
            return null;
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        };
    }

    /**
     * Convert array of DTOs to array of Domain Entities
     * @param {Array<object>} dtos - Array of DTOs
     * @returns {Array<User>} Array of domain entities
     */
    static toDomainList(dtos) {
        if (!Array.isArray(dtos)) {
            return [];
        }
        return dtos.map(dto => this.toDomain(dto));
    }

    /**
     * Convert array of Domain Entities to array of DTOs
     * @param {Array<User>} users - Array of domain entities
     * @returns {Array<object>} Array of DTOs
     */
    static toDTOList(users) {
        if (!Array.isArray(users)) {
            return [];
        }
        return users.map(user => this.toDTO(user));
    }
}
