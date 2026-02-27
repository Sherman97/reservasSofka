import { describe, it, expect } from 'vitest';
import { Location } from './Location';

describe('Location - Domain Entity', () => {
    const validData = {
        id: 'loc-1',
        name: 'Sala de Juntas A',
        description: 'Sala grande con proyector',
        imageUrl: '/img/sala-a.jpg',
        capacity: 20,
        type: 'sala',
        cityId: 'city-1',
        amenities: ['wifi', 'proyector', 'pizarra'],
    };

    describe('constructor', () => {
        it('should create a location with all properties', () => {
            const loc = new Location(validData);
            expect(loc.id).toBe('loc-1');
            expect(loc.name).toBe('Sala de Juntas A');
            expect(loc.capacity).toBe(20);
            expect(loc.amenities).toEqual(['wifi', 'proyector', 'pizarra']);
        });

        it('should default amenities to empty array', () => {
            const loc = new Location({ ...validData, amenities: undefined });
            expect(loc.amenities).toEqual([]);
        });
    });

    describe('isMeetingRoom', () => {
        it('should return true for type "sala"', () => {
            expect(new Location(validData).isMeetingRoom()).toBe(true);
        });

        it('should return false for other types', () => {
            const loc = new Location({ ...validData, type: 'oficina' });
            expect(loc.isMeetingRoom()).toBe(false);
        });
    });

    describe('hasAmenity', () => {
        it('should return true if amenity exists', () => {
            const loc = new Location(validData);
            expect(loc.hasAmenity('wifi')).toBe(true);
        });

        it('should return false if amenity does not exist', () => {
            const loc = new Location(validData);
            expect(loc.hasAmenity('cocina')).toBe(false);
        });
    });

    describe('canAccommodate', () => {
        it('should return true if capacity is sufficient', () => {
            const loc = new Location(validData);
            expect(loc.canAccommodate(15)).toBe(true);
        });

        it('should return true for exact capacity', () => {
            const loc = new Location(validData);
            expect(loc.canAccommodate(20)).toBe(true);
        });

        it('should return false if capacity is insufficient', () => {
            const loc = new Location(validData);
            expect(loc.canAccommodate(25)).toBe(false);
        });
    });

    describe('getDisplayInfo', () => {
        it('should return formatted display info', () => {
            const loc = new Location(validData);
            const info = loc.getDisplayInfo();
            expect(info.id).toBe('loc-1');
            expect(info.title).toBe('Sala de Juntas A');
            expect(info.subtitle).toContain('20');
            expect(info.image).toBe('/img/sala-a.jpg');
            expect(info.type).toBe('location');
        });
    });

    describe('serialization', () => {
        it('should serialize and deserialize correctly', () => {
            const loc = new Location(validData);
            const json = loc.toJSON();
            const restored = Location.fromJSON(json);
            expect(restored).toBeInstanceOf(Location);
            expect(restored.id).toBe('loc-1');
            expect(restored.amenities).toEqual(['wifi', 'proyector', 'pizarra']);
        });
    });
});
