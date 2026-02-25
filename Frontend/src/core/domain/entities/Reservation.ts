export interface ReservationProps {
    id: string;
    userId: string;
    locationId: string;
    locationName: string;
    startAt: string | Date;
    endAt: string | Date;
    equipment?: string[];
    status?: string;
    createdAt?: string | Date;
}

export class Reservation {
    public readonly id: string;
    public readonly userId: string;
    public readonly locationId: string;
    public readonly locationName: string;
    public readonly startAt: Date;
    public readonly endAt: Date;
    public readonly equipment: string[];
    public readonly status: string;
    public readonly createdAt: Date;

    constructor({
        id, userId, locationId, locationName, startAt, endAt,
        equipment = [], status = 'active', createdAt
    }: ReservationProps) {
        this.id = id;
        this.userId = userId;
        this.locationId = locationId;
        this.locationName = locationName;
        this.startAt = new Date(startAt);
        this.endAt = new Date(endAt);
        this.equipment = equipment;
        this.status = status;
        this.createdAt = createdAt ? new Date(createdAt) : new Date();
    }

    isActive(): boolean {
        const s = (this.status || '').toLowerCase();
        return ['active', 'confirmed', 'pending', 'created'].includes(s);
    }

    isCancelled(): boolean {
        return (this.status || '').toLowerCase() === 'cancelled';
    }

    isPast(): boolean {
        return this.endAt < new Date();
    }

    isUpcoming(): boolean {
        return !this.isPast() && !this.isCancelled();
    }

    isOngoing(): boolean {
        const now = new Date();
        return this.startAt <= now && this.endAt >= now && !this.isCancelled();
    }

    getDurationHours(): number {
        const diffMs = this.endAt.getTime() - this.startAt.getTime();
        return diffMs / (1000 * 60 * 60);
    }

    getFormattedDateRange(): string {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        const start = this.startAt.toLocaleDateString('es-ES', options);
        const end = this.endAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        return `${start} - ${end}`;
    }

    overlaps(startAt: string | Date, endAt: string | Date): boolean {
        const start = new Date(startAt);
        const end = new Date(endAt);
        return this.startAt < end && this.endAt > start;
    }

    toJSON(): Record<string, unknown> {
        return {
            id: this.id, userId: this.userId, locationId: this.locationId,
            locationName: this.locationName, startAt: this.startAt.toISOString(),
            endAt: this.endAt.toISOString(), equipment: this.equipment,
            status: this.status, createdAt: this.createdAt.toISOString()
        };
    }

    static fromJSON(json: ReservationProps): Reservation {
        return new Reservation(json);
    }
}
