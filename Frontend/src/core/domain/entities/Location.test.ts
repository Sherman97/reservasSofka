import { describe, it, expect } from 'vitest';
import { Location } from './Location';

describe('Location Entity', () => {
    const defaultProps = {
        id: 'loc1',
        name: 'Sala Bogotá',
        description: 'Sala de reuniones principal',
        imageUrl: 'https://img.com/sala.jpg',
        capacity: 10,
        type: 'sala',
        cityId: 'city1',
        amenities: ['wifi', 'proyector', 'pizarra']
    };

    describe('constructor', () => {
        it('debe crear una ubicación con todas las propiedades', () => {
            const location = new Location(defaultProps);
            expect(location.id).toBe('loc1');
            expect(location.name).toBe('Sala Bogotá');
            expect(location.description).toBe('Sala de reuniones principal');
            expect(location.imageUrl).toBe('https://img.com/sala.jpg');
            expect(location.capacity).toBe(10);
            expect(location.type).toBe('sala');
            expect(location.cityId).toBe('city1');
            expect(location.amenities).toEqual(['wifi', 'proyector', 'pizarra']);
        });

        it('debe asignar amenities vacío por defecto', () => {
            const location = new Location({ ...defaultProps, amenities: undefined });
            expect(location.amenities).toEqual([]);
        });

        it('debe aceptar cityId null', () => {
            const location = new Location({ ...defaultProps, cityId: null });
            expect(location.cityId).toBeNull();
        });
    });

    describe('isMeetingRoom()', () => {
        it('debe retornar true si type es sala', () => {
            const location = new Location(defaultProps);
            expect(location.isMeetingRoom()).toBe(true);
        });

        it('debe retornar false si type no es sala', () => {
            const location = new Location({ ...defaultProps, type: 'escritorio' });
            expect(location.isMeetingRoom()).toBe(false);
        });
    });

    describe('hasAmenity()', () => {
        it('debe retornar true si tiene la amenidad', () => {
            const location = new Location(defaultProps);
            expect(location.hasAmenity('wifi')).toBe(true);
        });

        it('debe retornar false si no tiene la amenidad', () => {
            const location = new Location(defaultProps);
            expect(location.hasAmenity('estacionamiento')).toBe(false);
        });
    });

    describe('canAccommodate()', () => {
        it('debe retornar true si caben las personas', () => {
            const location = new Location(defaultProps);
            expect(location.canAccommodate(10)).toBe(true);
        });

        it('debe retornar true si hay menos personas que capacidad', () => {
            const location = new Location(defaultProps);
            expect(location.canAccommodate(5)).toBe(true);
        });

        it('debe retornar false si no caben las personas', () => {
            const location = new Location(defaultProps);
            expect(location.canAccommodate(11)).toBe(false);
        });
    });

    describe('getDisplayInfo()', () => {
        it('debe retornar info de display correcta', () => {
            const location = new Location(defaultProps);
            const info = location.getDisplayInfo();
            expect(info).toEqual({
                id: 'loc1',
                title: 'Sala Bogotá',
                subtitle: 'Capacidad: 10 personas',
                image: 'https://img.com/sala.jpg',
                type: 'location'
            });
        });
    });

    describe('toJSON()', () => {
        it('debe serializar correctamente', () => {
            const location = new Location(defaultProps);
            expect(location.toJSON()).toEqual(defaultProps);
        });
    });

    describe('fromJSON()', () => {
        it('debe deserializar correctamente', () => {
            const location = Location.fromJSON(defaultProps);
            expect(location).toBeInstanceOf(Location);
            expect(location.name).toBe('Sala Bogotá');
        });

        it('roundtrip toJSON/fromJSON debe preservar datos', () => {
            const original = new Location(defaultProps);
            const restored = Location.fromJSON(original.toJSON());
            expect(restored.toJSON()).toEqual(original.toJSON());
        });
    });
});
