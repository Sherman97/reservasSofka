/**
 * Reservation - Domain Entity
 * Represents a reservation in the system
 */
export class Reservation {
    constructor({
        id,
        userId,
        locationId,
        locationName,
        startAt,
        endAt,
        equipment = [],
        status = 'active',
        createdAt
    }) {
        this.id = id;
        this.userId = userId;
        this.locationId = locationId;
        this.locationName = locationName;
        this.startAt = new Date(startAt);
        this.endAt = new Date(endAt);
        this.equipment = equipment; // Array of equipment IDs
        this.status = status; // 'active', 'cancelled', 'completed'
        this.createdAt = createdAt ? new Date(createdAt) : new Date();
    }

    /**
     * Check if reservation is active
     * @returns {boolean}
     */
    isActive() {
        const s = (this.status || '').toLowerCase();
        return ['active', 'confirmed', 'pending', 'created'].includes(s);
    }

    /**
     * Check if reservation is cancelled
     * @returns {boolean}
     */
    isCancelled() {
        return (this.status || '').toLowerCase() === 'cancelled';
    }

    /**
     * Check if reservation is in the past
     * @returns {boolean}
     */
    isPast() {
        return this.endAt < new Date();
    }

    /**
     * Check if reservation is upcoming or ongoing
     * @returns {boolean}
     */
    isUpcoming() {
        // If it hasn't ended and it's not cancelled, it should be visible in "Upcoming/Active"
        return !this.isPast() && !this.isCancelled();
    }

    /**
     * Check if reservation is currently happening
     * @returns {boolean}
     */
    isOngoing() {
        const now = new Date();
        return this.startAt <= now && this.endAt >= now && !this.isCancelled();
    }

    /**
     * Get duration in hours
     * @returns {number}
     */
    getDurationHours() {
        const diffMs = this.endAt - this.startAt;
        return diffMs / (1000 * 60 * 60);
    }

    /**
     * Get formatted date range
     * @returns {string}
     */
    getFormattedDateRange() {
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        const start = this.startAt.toLocaleDateString('es-ES', options);
        const end = this.endAt.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
        return `${start} - ${end}`;
    }

    /**
     * Check if reservation overlaps with time range
     * @param {Date} startAt
     * @param {Date} endAt
     * @returns {boolean}
     */
    overlaps(startAt, endAt) {
        const start = new Date(startAt);
        const end = new Date(endAt);
        return this.startAt < end && this.endAt > start;
    }

    /**
     * Convert to JSON
     * @returns {object}
     */
    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            locationId: this.locationId,
            locationName: this.locationName,
            startAt: this.startAt.toISOString(),
            endAt: this.endAt.toISOString(),
            equipment: this.equipment,
            status: this.status,
            createdAt: this.createdAt.toISOString()
        };
    }

    /**
     * Create from JSON
     * @param {object} json
     * @returns {Reservation}
     */
    static fromJSON(json) {
        return new Reservation(json);
    }
}
