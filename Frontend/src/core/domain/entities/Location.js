/**
 * Location - Domain Entity
 * Represents a physical location/room in the system
 */
export class Location {
    constructor({ id, name, description, imageUrl, capacity, type, cityId, amenities = [] }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.imageUrl = imageUrl;
        this.capacity = capacity;
        this.type = type; // 'sala' or other types
        this.cityId = cityId;
        this.amenities = amenities;
    }

    /**
     * Check if location is a meeting room
     * @returns {boolean}
     */
    isMeetingRoom() {
        return this.type === 'sala';
    }

    /**
     * Check if location has specific amenity
     * @param {string} amenity - Amenity to check
     * @returns {boolean}
     */
    hasAmenity(amenity) {
        return this.amenities.includes(amenity);
    }

    /**
     * Check if location can accommodate number of people
     * @param {number} people - Number of people
     * @returns {boolean}
     */
    canAccommodate(people) {
        return this.capacity >= people;
    }

    /**
     * Get display info for UI
     * @returns {object}
     */
    getDisplayInfo() {
        return {
            id: this.id,
            title: this.name,
            subtitle: `Capacidad: ${this.capacity} personas`,
            image: this.imageUrl,
            type: 'location'
        };
    }

    /**
     * Convert to JSON
     * @returns {object}
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            imageUrl: this.imageUrl,
            capacity: this.capacity,
            type: this.type,
            cityId: this.cityId,
            amenities: this.amenities
        };
    }

    /**
     * Create from JSON
     * @param {object} json
     * @returns {Location}
     */
    static fromJSON(json) {
        return new Location(json);
    }
}
