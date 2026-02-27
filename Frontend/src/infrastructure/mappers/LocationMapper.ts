import { Location } from '../../core/domain/entities/Location';
import type { LocationProps } from '../../core/domain/entities/Location';

interface LocationDTO {
    id?: string;
    spaceId?: string;
    name?: string;
    spaceName?: string;
    description?: string;
    image?: string;
    imageUrl?: string;
    imageURL?: string;
    capacity?: number;
    maxCapacity?: number;
    type?: string;
    cityId?: string;
    tags?: string[];
    amenities?: string[];
}

export class LocationMapper {
    static toDomain(dto: LocationDTO): Location | null {
        if (!dto) return null;
        return new Location({
            id: dto.id || dto.spaceId || '',
            name: dto.name || dto.spaceName || '',
            description: dto.description || '',
            imageUrl: dto.image || dto.imageUrl || dto.imageURL || '',
            capacity: dto.capacity || dto.maxCapacity || 0,
            type: dto.type || 'sala',
            cityId: dto.cityId || null,
            amenities: dto.tags || dto.amenities || []
        });
    }

    static toDTO(location: Location): LocationProps | null {
        if (!location) return null;
        return {
            id: location.id, name: location.name, description: location.description,
            imageUrl: location.imageUrl, capacity: location.capacity, type: location.type,
            cityId: location.cityId, amenities: location.amenities
        };
    }

    static toDomainList(dtos: LocationDTO[]): Location[] {
        if (!Array.isArray(dtos)) return [];
        return dtos.map(dto => this.toDomain(dto)).filter((l): l is Location => l !== null);
    }
}
