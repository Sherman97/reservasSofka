export interface DeliveryProps {
    id: string;
    locationId: string;
    userId: string;
    managerId: string;
    notes: string;
    date?: string | Date;
}

export class Delivery {
    public readonly id: string;
    public readonly locationId: string;
    public readonly userId: string;
    public readonly managerId: string;
    public readonly notes: string;
    public readonly date: Date;

    constructor({ id, locationId, userId, managerId, notes, date }: DeliveryProps) {
        this.id = id;
        this.locationId = locationId;
        this.userId = userId;
        this.managerId = managerId;
        this.notes = notes;
        this.date = date ? new Date(date) : new Date();
    }

    hasNotes(): boolean {
        return this.notes.trim().length > 0;
    }

    isValid(): boolean {
        return !!(this.locationId && this.userId && this.managerId);
    }

    toJSON(): DeliveryProps {
        return {
            id: this.id,
            locationId: this.locationId,
            userId: this.userId,
            managerId: this.managerId,
            notes: this.notes,
            date: this.date.toISOString(),
        };
    }

    static fromJSON(json: DeliveryProps): Delivery {
        return new Delivery(json);
    }
}
