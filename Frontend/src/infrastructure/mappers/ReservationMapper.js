import { Reservation } from '../../core/domain/entities/Reservation';

/**
 * ReservationMapper - Data Mapper Pattern
 * Converts between API DTOs and Reservation Domain Entities
 */
export class ReservationMapper {
    /**
     * Convert API DTO to Domain Entity
     * @param {object} dto - Data Transfer Object from API
     * @returns {Reservation} Domain entity
     */
    static toDomain(dto) {
        if (!dto) {
            return null;
        }

        return new Reservation({
            id: dto.id || dto.bookingId,
            userId: dto.userId || dto.user_id,
            locationId: dto.spaceId || dto.locationId || dto.space_id,
            locationName: dto.spaceName || dto.locationName || dto.space_name || 'Unknown',
            startAt: dto.startAt || dto.start_at,
            endAt: dto.endAt || dto.end_at,
            equipment: dto.items || dto.equipment || [],
            status: ReservationMapper.normalizeStatus(dto.status),
            createdAt: dto.createdAt || dto.created_at || new Date()
        });
    }

    static normalizeStatus(status) {
        if (!status) return 'active';
        const s = status.toLowerCase();
        if (['pending', 'confirmed', 'in_progress', 'active', 'created'].includes(s)) {
            return 'active';
        }
        return s;
    }

    /**
     * Convert Domain Entity to API DTO
     * @param {Reservation} reservation - Domain entity
     * @returns {object} Data Transfer Object for API
     */
    static toDTO(reservation) {
        if (!reservation) {
            return null;
        }

        return {
            id: reservation.id,
            userId: reservation.userId,
            locationId: reservation.locationId,
            locationName: reservation.locationName,
            startAt: reservation.startAt.toISOString(),
            endAt: reservation.endAt.toISOString(),
            equipment: reservation.equipment,
            status: reservation.status,
            createdAt: reservation.createdAt.toISOString()
        };
    }

    /**
     * Prepare payload for creating a reservation in the API
     * @param {object} reservationData - Raw data from UI/Use Case
     * @returns {object} API payload
     */
    static toApi(reservationData) {
        // Format dates for API
        // reservationData.date comes as YYYY-MM-DD
        // reservationData.startTime/endTime come as HH:MM
        const [year, month, day] = reservationData.date.split('-').map(Number);
        const [startHours, startMinutes] = reservationData.startTime.split(':').map(Number);
        const [endHours, endMinutes] = reservationData.endTime.split(':').map(Number);

        // Create Date objects (assuming local time)
        const startAt = new Date(year, month - 1, day, startHours, startMinutes).toISOString();
        const endAt = new Date(year, month - 1, day, endHours, endMinutes).toISOString();

        // Map equipment to IDs (backend expects List<Long>)
        const equipmentIds = (reservationData.equipment || []).map(item => {
            if (typeof item === 'object') {
                return item.itemId || item.id;
            }
            return item;
        });

        return {
            spaceId: reservationData.locationId,
            startAt,
            endAt,
            title: reservationData.title || `Reserva de ${reservationData.locationName || 'espacio'}`,
            attendeesCount: reservationData.attendeesCount || 1,
            notes: reservationData.notes || '',
            equipmentIds: equipmentIds
        };
    }

    /**
     * Convert array of DTOs to array of Domain Entities
     * @param {Array<object>} dtos - Array of DTOs
     * @returns {Array<Reservation>} Array of domain entities
     */
    static toDomainList(dtos) {
        if (!Array.isArray(dtos)) {
            return [];
        }
        return dtos.map(dto => this.toDomain(dto)).filter(Boolean);
    }
}
