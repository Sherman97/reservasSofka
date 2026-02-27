import { InventoryItem } from '../../core/domain/entities/InventoryItem';
import type { InventoryItemProps } from '../../core/domain/entities/InventoryItem';

interface InventoryDTO {
    id?: string;
    itemId?: string;
    name?: string;
    itemName?: string;
    description?: string;
    image?: string;
    imageUrl?: string;
    imageURL?: string;
    quantity?: number;
    qty?: number;
    available_qty?: number;
    category?: string;
    available?: boolean;
}

export class InventoryMapper {
    static toDomain(dto: InventoryDTO): InventoryItem | null {
        if (!dto) return null;
        return new InventoryItem({
            id: dto.id || dto.itemId || '',
            name: dto.name || dto.itemName || '',
            description: dto.description || '',
            imageUrl: dto.image || dto.imageUrl || dto.imageURL || '',
            quantity: dto.quantity || dto.qty || dto.available_qty || 0,
            category: dto.category || 'general',
            available: dto.available !== undefined ? dto.available : true
        });
    }

    static toDTO(item: InventoryItem): InventoryItemProps | null {
        if (!item) return null;
        return {
            id: item.id, name: item.name, description: item.description,
            imageUrl: item.imageUrl, quantity: item.quantity,
            category: item.category, available: item.available
        };
    }

    static toDomainList(dtos: InventoryDTO[]): InventoryItem[] {
        if (!Array.isArray(dtos)) return [];
        return dtos.map(dto => this.toDomain(dto)).filter((i): i is InventoryItem => i !== null);
    }
}
