export interface LocationProps {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    capacity: number;
    type: string;
    cityId: string | null;
    amenities?: string[];
}

export interface LocationDisplayInfo {
    id: string;
    title: string;
    subtitle: string;
    image: string;
    type: string;
}

export class Location {
    public readonly id: string;
    public readonly name: string;
    public readonly description: string;
    public readonly imageUrl: string;
    public readonly capacity: number;
    public readonly type: string;
    public readonly cityId: string | null;
    public readonly amenities: string[];

    constructor({ id, name, description, imageUrl, capacity, type, cityId, amenities = [] }: LocationProps) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.imageUrl = imageUrl;
        this.capacity = capacity;
        this.type = type;
        this.cityId = cityId;
        this.amenities = amenities;
    }

    isMeetingRoom(): boolean {
        return this.type === 'sala';
    }

    hasAmenity(amenity: string): boolean {
        return this.amenities.includes(amenity);
    }

    canAccommodate(people: number): boolean {
        return this.capacity >= people;
    }

    getDisplayInfo(): LocationDisplayInfo {
        return {
            id: this.id,
            title: this.name,
            subtitle: `Capacidad: ${this.capacity} personas`,
            image: this.imageUrl,
            type: 'location'
        };
    }

    toJSON(): LocationProps {
        return {
            id: this.id, name: this.name, description: this.description,
            imageUrl: this.imageUrl, capacity: this.capacity, type: this.type,
            cityId: this.cityId, amenities: this.amenities
        };
    }

    static fromJSON(json: LocationProps): Location {
        return new Location(json);
    }
}
