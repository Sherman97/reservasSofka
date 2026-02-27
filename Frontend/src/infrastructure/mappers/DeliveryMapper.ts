import { Delivery } from '../../core/domain/entities/Delivery';

interface DeliveryDTO {
    id?: string;
    locationId?: string;
    location_id?: string;
    userId?: string;
    user_id?: string;
    managerId?: string;
    manager_id?: string;
    notes?: string;
    novedad?: string;
    date?: string;
    fecha?: string;
    [key: string]: unknown;
}

interface DeliveryApiPayload {
    locationId: string;
    userId: string;
    managerId: string;
    notes: string;
    date: string;
}

interface DeliveryFormData {
    locationId: string;
    userId: string;
    managerId: string;
    notes: string;
    date: string;
}

export class DeliveryMapper {
    static toDomain(dto: DeliveryDTO): Delivery | null {
        if (!dto) return null;
        return new Delivery({
            id: (dto.id as string) || '',
            locationId: dto.locationId || dto.location_id || '',
            userId: dto.userId || dto.user_id || '',
            managerId: dto.managerId || dto.manager_id || '',
            notes: dto.notes || dto.novedad || '',
            date: dto.date || dto.fecha || new Date().toISOString(),
        });
    }

    static toApi(formData: DeliveryFormData): DeliveryApiPayload {
        return {
            locationId: formData.locationId,
            userId: formData.userId,
            managerId: formData.managerId,
            notes: formData.notes,
            date: new Date(formData.date).toISOString(),
        };
    }

    static toDomainList(dtos: DeliveryDTO[]): Delivery[] {
        if (!Array.isArray(dtos)) return [];
        return dtos
            .map((dto) => this.toDomain(dto))
            .filter((d): d is Delivery => d !== null);
    }
}
