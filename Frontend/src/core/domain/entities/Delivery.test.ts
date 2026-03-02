import { describe, it, expect } from 'vitest';
import { Delivery } from './Delivery';

describe('Delivery Entity', () => {
    it('debe crear una entidad Delivery con todas las propiedades', () => {
        const delivery = new Delivery({
            id: 'd1',
            locationId: 'l1',
            userId: 'u1',
            managerId: 'm1',
            notes: 'Sin novedades, sala en buen estado',
            date: '2026-02-26T15:00:00',
        });

        expect(delivery.id).toBe('d1');
        expect(delivery.locationId).toBe('l1');
        expect(delivery.userId).toBe('u1');
        expect(delivery.managerId).toBe('m1');
        expect(delivery.notes).toBe('Sin novedades, sala en buen estado');
        expect(delivery.date).toBeInstanceOf(Date);
    });

    it('debe crear Delivery con fecha por defecto (ahora) si no se provee', () => {
        const delivery = new Delivery({
            id: 'd2',
            locationId: 'l1',
            userId: 'u1',
            managerId: 'm1',
            notes: '',
        });

        expect(delivery.date).toBeInstanceOf(Date);
    });

    it('debe crear Delivery con notas vacías', () => {
        const delivery = new Delivery({
            id: 'd3',
            locationId: 'l1',
            userId: 'u1',
            managerId: 'm1',
            notes: '',
            date: '2026-02-26T15:00:00',
        });

        expect(delivery.notes).toBe('');
    });

    it('hasNotes() debe retornar true si hay novedades', () => {
        const delivery = new Delivery({
            id: 'd4',
            locationId: 'l1',
            userId: 'u1',
            managerId: 'm1',
            notes: 'Proyector no funciona',
            date: '2026-02-26T15:00:00',
        });

        expect(delivery.hasNotes()).toBe(true);
    });

    it('hasNotes() debe retornar false si no hay novedades', () => {
        const delivery = new Delivery({
            id: 'd5',
            locationId: 'l1',
            userId: 'u1',
            managerId: 'm1',
            notes: '',
            date: '2026-02-26T15:00:00',
        });

        expect(delivery.hasNotes()).toBe(false);
    });

    it('isValid() debe retornar true si todos los campos requeridos están presentes', () => {
        const delivery = new Delivery({
            id: 'd6',
            locationId: 'l1',
            userId: 'u1',
            managerId: 'm1',
            notes: 'Todo bien',
            date: '2026-02-26T15:00:00',
        });

        expect(delivery.isValid()).toBe(true);
    });

    it('isValid() debe retornar false si falta locationId', () => {
        const delivery = new Delivery({
            id: 'd7',
            locationId: '',
            userId: 'u1',
            managerId: 'm1',
            notes: 'Todo bien',
            date: '2026-02-26T15:00:00',
        });

        expect(delivery.isValid()).toBe(false);
    });

    it('isValid() debe retornar false si falta userId', () => {
        const delivery = new Delivery({
            id: 'd8',
            locationId: 'l1',
            userId: '',
            managerId: 'm1',
            notes: 'Todo bien',
            date: '2026-02-26T15:00:00',
        });

        expect(delivery.isValid()).toBe(false);
    });

    it('isValid() debe retornar false si falta managerId', () => {
        const delivery = new Delivery({
            id: 'd9',
            locationId: 'l1',
            userId: 'u1',
            managerId: '',
            notes: 'Todo bien',
            date: '2026-02-26T15:00:00',
        });

        expect(delivery.isValid()).toBe(false);
    });

    it('toJSON() debe retornar un objeto serializable', () => {
        const delivery = new Delivery({
            id: 'd10',
            locationId: 'l1',
            userId: 'u1',
            managerId: 'm1',
            notes: 'Novedad de prueba',
            date: '2026-02-26T15:00:00',
        });

        const json = delivery.toJSON();
        expect(json).toHaveProperty('id', 'd10');
        expect(json).toHaveProperty('locationId', 'l1');
        expect(json).toHaveProperty('userId', 'u1');
        expect(json).toHaveProperty('managerId', 'm1');
        expect(json).toHaveProperty('notes', 'Novedad de prueba');
        expect(json).toHaveProperty('date');
    });

    it('fromJSON() debe crear una instancia desde un objeto plano', () => {
        const json = {
            id: 'd11',
            locationId: 'l1',
            userId: 'u1',
            managerId: 'm1',
            notes: 'Test',
            date: '2026-02-26T15:00:00',
        };

        const delivery = Delivery.fromJSON(json);
        expect(delivery).toBeInstanceOf(Delivery);
        expect(delivery.id).toBe('d11');
        expect(delivery.managerId).toBe('m1');
    });
});
