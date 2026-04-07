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
    attendeesCount?: number;
    notes?: string;
    checkedInAt?: string | Date | null;
}

// Reservation status constants
export const ReservationStatus = {
    PENDING: 'pending',
    CHECKED_IN: 'checked_in',
    NO_SHOW: 'no_show',
    CANCELED: 'canceled',
    COMPLETED: 'completed',
    ACTIVE: 'active',
    CONFIRMED: 'confirmed'
} as const;

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
    public readonly attendeesCount: number;
    public readonly notes: string;
    public readonly checkedInAt: Date | null;

    // Grace period for check-in (5 minutes after start time)
    private static readonly CHECK_IN_GRACE_PERIOD_MINUTES = 5;

    constructor({
        id, userId, locationId, locationName, startAt, endAt,
        equipment = [], status = 'active', createdAt,
        attendeesCount = 1, notes = '', checkedInAt = null
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
        this.attendeesCount = attendeesCount ?? 1;
        this.notes = notes ?? '';
        this.checkedInAt = checkedInAt ? new Date(checkedInAt) : null;
    }

    isActive(): boolean {
        const s = (this.status || '').toLowerCase();
        return ['active', 'confirmed', 'pending', 'created', 'in_progress', 'checked_in'].includes(s);
    }

    isConfirmed(): boolean {
        const s = (this.status || '').toLowerCase();
        return ['confirmed', 'active', 'pending', 'created', 'checked_in'].includes(s);
    }

    isPending(): boolean {
        return (this.status || '').toLowerCase() === 'pending';
    }

    isCheckedIn(): boolean {
        return (this.status || '').toLowerCase() === 'checked_in';
    }

    isNoShow(): boolean {
        return (this.status || '').toLowerCase() === 'no_show';
    }

    isInProgress(): boolean {
        return (this.status || '').toLowerCase() === 'in_progress';
    }

    isCompleted(): boolean {
        return (this.status || '').toLowerCase() === 'completed';
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

    getRemainingMinutes(): number {
        const now = new Date();
        if (this.endAt <= now) return 0;
        const diffMs = this.endAt.getTime() - now.getTime();
        return Math.ceil(diffMs / (1000 * 60));
    }

    /**
     * Checks if the reservation can be checked in with QR code.
     * Conditions:
     * - Status must be PENDING
     * - Current time must be within grace period after start time (5 minutes)
     */
    canCheckIn(gracePeriodMinutes: number = Reservation.CHECK_IN_GRACE_PERIOD_MINUTES): boolean {
        if (!this.isPending()) {
            return false;
        }

        const now = new Date();
        const graceDeadline = new Date(this.startAt.getTime() + gracePeriodMinutes * 60 * 1000);
        
        // Must be after start time and before grace deadline
        return now >= this.startAt && now <= graceDeadline;
    }

    /**,
            checkedInAt: this.checkedInAt?.toISOString() || null
     * Checks if the check-in period has expired.
     */
    isExpired(gracePeriodMinutes: number = Reservation.CHECK_IN_GRACE_PERIOD_MINUTES): boolean {
        if (!this.isPending()) {
            return false;
        }

        const now = new Date();
        const graceDeadline = new Date(this.startAt.getTime() + gracePeriodMinutes * 60 * 1000);
        
        return now > graceDeadline;
    }

    /**
     * Gets the remaining time for check-in in minutes.
     * Returns 0 if expired or not pending.
     */
    getCheckInRemainingMinutes(gracePeriodMinutes: number = Reservation.CHECK_IN_GRACE_PERIOD_MINUTES): number {
        if (!this.isPending()) {
            return 0;
        }

        const now = new Date();
        const graceDeadline = new Date(this.startAt.getTime() + gracePeriodMinutes * 60 * 1000);
        
        if (now > graceDeadline) {
            return 0;
        }

        const diffMs = graceDeadline.getTime() - now.getTime();
        return Math.ceil(diffMs / (1000 * 60));
    }

    isAboutToExpire(thresholdMinutes: number = 2): boolean {
        if (this.isCancelled() || this.isPast()) return false;
        const remaining = this.getRemainingMinutes();
        return remaining > 0 && remaining <= thresholdMinutes;
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
            status: this.status, createdAt: this.createdAt.toISOString(),
            attendeesCount: this.attendeesCount, notes: this.notes
        };
    }

    static fromJSON(json: ReservationProps): Reservation {
        return new Reservation(json);
    }
}
