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
            status: dto.status || 'active',
            createdAt: dto.createdAt || dto.created_at || new Date()
        });
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
