import { InventoryItem } from '../../core/domain/entities/InventoryItem';

/**
 * InventoryMapper - Data Mapper Pattern
 * Converts between API DTOs and InventoryItem Domain Entities
 */
export class InventoryMapper {
    /**
     * Convert API DTO to Domain Entity
     * @param {object} dto - Data Transfer Object from API
     * @returns {InventoryItem} Domain entity
     */
    static toDomain(dto) {
        if (!dto) {
            return null;
        }

        return new InventoryItem({
            id: dto.id || dto.itemId,
            name: dto.name || dto.itemName,
            description: dto.description || '',
            imageUrl: dto.image || dto.imageUrl || dto.imageURL || '',
            quantity: dto.quantity || dto.qty || dto.available_qty || 0,
            category: dto.category || 'general',
            available: dto.available !== undefined ? dto.available : true
        });
    }

    /**
     * Convert Domain Entity to API DTO
     * @param {InventoryItem} item - Domain entity
     * @returns {object} Data Transfer Object for API
     */
    static toDTO(item) {
        if (!item) {
            return null;
        }

        return {
            id: item.id,
            name: item.name,
            description: item.description,
            imageUrl: item.imageUrl,
            quantity: item.quantity,
            category: item.category,
            available: item.available
        };
    }

    /**
     * Convert array of DTOs to array of Domain Entities
     * @param {Array<object>} dtos - Array of DTOs
     * @returns {Array<InventoryItem>} Array of domain entities
     */
    static toDomainList(dtos) {
        if (!Array.isArray(dtos)) {
            return [];
        }
        return dtos.map(dto => this.toDomain(dto)).filter(Boolean);
    }
}
