import { Reservation } from '../../core/domain/entities/Reservation';

interface ReservationDTO {
    id?: string;
    bookingId?: string;
    userId?: string;
    user_id?: string;
    spaceId?: string;
    locationId?: string;
    space_id?: string;
    spaceName?: string;
    locationName?: string;
    space_name?: string;
    title?: string;
    startAt?: string;
    start_at?: string;
    endAt?: string;
    end_at?: string;
    equipments?: string[];
    items?: string[];
    equipment?: string[];
    status?: string;
    createdAt?: string;
    created_at?: string;
}

interface ReservationApiPayload {
    spaceId: string;
    startAt: string;
    endAt: string;
    title: string;
    attendeesCount: number;
    notes: string;
    equipmentIds: string[];
}

interface CreateReservationData {
    locationId: string;
    locationName?: string;
    date: string;
    startTime: string;
    endTime: string;
    title?: string;
    attendeesCount?: number;
    notes?: string;
    equipment?: Array<{ itemId?: string; id?: string } | string>;
}

export class ReservationMapper {
    static toDomain(dto: ReservationDTO): Reservation | null {
        if (!dto) return null;
        return new Reservation({
            id: dto.id || dto.bookingId || '',
            userId: dto.userId || dto.user_id || '',
            locationId: dto.spaceId || dto.locationId || dto.space_id || '',
            locationName: dto.spaceName || dto.locationName || dto.space_name || dto.title || 'Unknown',
            startAt: dto.startAt || dto.start_at || '',
            endAt: dto.endAt || dto.end_at || '',
            equipment: dto.equipments || dto.items || dto.equipment || [],
            status: ReservationMapper.normalizeStatus(dto.status),
            createdAt: dto.createdAt || dto.created_at || new Date().toISOString()
        });
    }

    static normalizeStatus(status?: string): string {
        if (!status) return 'active';
        const s = status.toLowerCase();
        if (s === 'in_progress') return 'in_progress';
        if (['pending', 'confirmed', 'active', 'created'].includes(s)) {
            return 'active';
        }
        return s;
    }

    static toDTO(reservation: Reservation): Record<string, unknown> | null {
        if (!reservation) return null;
        return {
            id: reservation.id, userId: reservation.userId,
            locationId: reservation.locationId, locationName: reservation.locationName,
            startAt: reservation.startAt.toISOString(), endAt: reservation.endAt.toISOString(),
            equipment: reservation.equipment, status: reservation.status,
            createdAt: reservation.createdAt.toISOString()
        };
    }

    static toApi(reservationData: CreateReservationData): ReservationApiPayload {
        const [year, month, day] = reservationData.date.split('-').map(Number);
        const [startHours, startMinutes] = reservationData.startTime.split(':').map(Number);
        const [endHours, endMinutes] = reservationData.endTime.split(':').map(Number);

        const startAt = new Date(year, month - 1, day, startHours, startMinutes).toISOString();
        const endAt = new Date(year, month - 1, day, endHours, endMinutes).toISOString();

        const equipmentIds = (reservationData.equipment || []).map(item => {
            if (typeof item === 'object') return (item as { itemId?: string; id?: string }).itemId || (item as { id?: string }).id || '';
            return item as string;
        });

        return {
            spaceId: reservationData.locationId,
            startAt, endAt,
            title: reservationData.title || `Reserva de ${reservationData.locationName || 'espacio'}`,
            attendeesCount: reservationData.attendeesCount || 1,
            notes: reservationData.notes || '',
            equipmentIds
        };
    }

    static toDomainList(dtos: ReservationDTO[]): Reservation[] {
        if (!Array.isArray(dtos)) return [];
        return dtos.map(dto => this.toDomain(dto)).filter((r): r is Reservation => r !== null);
    }
}
