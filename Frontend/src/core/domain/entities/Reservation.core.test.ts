import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Reservation } from './Reservation';

describe('Reservation - Core Methods', () => {
    const baseProps = {
        id: 'r1',
        userId: 'u1',
        locationId: 'l1',
        locationName: 'Sala A',
        startAt: '2026-03-01T10:00:00Z',
        endAt: '2026-03-01T12:00:00Z',
        equipment: ['e1', 'e2'],
        status: 'active',
        createdAt: '2026-02-28T08:00:00Z'
    };

    describe('constructor', () => {
        it('debe crear reserva con todas las propiedades', () => {
            const r = new Reservation(baseProps);
            expect(r.id).toBe('r1');
            expect(r.userId).toBe('u1');
            expect(r.locationId).toBe('l1');
            expect(r.locationName).toBe('Sala A');
            expect(r.startAt).toBeInstanceOf(Date);
            expect(r.endAt).toBeInstanceOf(Date);
            expect(r.equipment).toEqual(['e1', 'e2']);
            expect(r.status).toBe('active');
            expect(r.createdAt).toBeInstanceOf(Date);
        });

        it('debe asignar defaults si no se proveen opcionales', () => {
            const r = new Reservation({
                id: 'r1', userId: 'u1', locationId: 'l1', locationName: 'Sala',
                startAt: '2026-03-01T10:00:00Z', endAt: '2026-03-01T11:00:00Z'
            });
            expect(r.equipment).toEqual([]);
            expect(r.status).toBe('active');
            expect(r.createdAt).toBeInstanceOf(Date);
        });

        it('debe aceptar Date objects', () => {
            const r = new Reservation({
                ...baseProps,
                startAt: new Date('2026-03-01T10:00:00Z'),
                endAt: new Date('2026-03-01T12:00:00Z')
            });
            expect(r.startAt).toBeInstanceOf(Date);
        });
    });

    describe('isActive()', () => {
        it('debe retornar true para status active', () => {
            expect(new Reservation(baseProps).isActive()).toBe(true);
        });

        it('debe retornar true para status confirmed', () => {
            expect(new Reservation({ ...baseProps, status: 'confirmed' }).isActive()).toBe(true);
        });

        it('debe retornar true para status pending', () => {
            expect(new Reservation({ ...baseProps, status: 'pending' }).isActive()).toBe(true);
        });

        it('debe retornar true para status created', () => {
            expect(new Reservation({ ...baseProps, status: 'created' }).isActive()).toBe(true);
        });

        it('debe retornar false para status cancelled', () => {
            expect(new Reservation({ ...baseProps, status: 'cancelled' }).isActive()).toBe(false);
        });
    });

    describe('isCancelled()', () => {
        it('debe retornar true para cancelled', () => {
            expect(new Reservation({ ...baseProps, status: 'cancelled' }).isCancelled()).toBe(true);
        });

        it('debe retornar false para active', () => {
            expect(new Reservation(baseProps).isCancelled()).toBe(false);
        });
    });

    describe('isPast()', () => {
        it('debe retornar true si endAt es pasado', () => {
            const r = new Reservation({ ...baseProps, endAt: '2020-01-01T00:00:00Z' });
            expect(r.isPast()).toBe(true);
        });

        it('debe retornar false si endAt es futuro', () => {
            const r = new Reservation({ ...baseProps, endAt: '2099-12-31T23:59:59Z' });
            expect(r.isPast()).toBe(false);
        });
    });

    describe('isUpcoming()', () => {
        it('debe retornar true si no es pasada ni cancelada', () => {
            const r = new Reservation({ ...baseProps, endAt: '2099-12-31T23:59:59Z' });
            expect(r.isUpcoming()).toBe(true);
        });

        it('debe retornar false si es cancelada', () => {
            const r = new Reservation({ ...baseProps, status: 'cancelled', endAt: '2099-12-31T23:59:59Z' });
            expect(r.isUpcoming()).toBe(false);
        });

        it('debe retornar false si es pasada', () => {
            const r = new Reservation({ ...baseProps, endAt: '2020-01-01T00:00:00Z' });
            expect(r.isUpcoming()).toBe(false);
        });
    });

    describe('isOngoing()', () => {
        beforeEach(() => { vi.useFakeTimers(); });
        afterEach(() => { vi.useRealTimers(); });

        it('debe retornar true si está en curso', () => {
            vi.setSystemTime(new Date('2026-03-01T11:00:00Z'));
            const r = new Reservation(baseProps);
            expect(r.isOngoing()).toBe(true);
        });

        it('debe retornar false si no ha comenzado', () => {
            vi.setSystemTime(new Date('2026-03-01T09:00:00Z'));
            const r = new Reservation(baseProps);
            expect(r.isOngoing()).toBe(false);
        });

        it('debe retornar false si ya terminó', () => {
            vi.setSystemTime(new Date('2026-03-01T13:00:00Z'));
            const r = new Reservation(baseProps);
            expect(r.isOngoing()).toBe(false);
        });

        it('debe retornar false si está cancelada aunque esté en el rango', () => {
            vi.setSystemTime(new Date('2026-03-01T11:00:00Z'));
            const r = new Reservation({ ...baseProps, status: 'cancelled' });
            expect(r.isOngoing()).toBe(false);
        });
    });

    describe('getDurationHours()', () => {
        it('debe calcular duración en horas', () => {
            const r = new Reservation(baseProps);
            expect(r.getDurationHours()).toBe(2);
        });

        it('debe retornar fracciones de hora', () => {
            const r = new Reservation({
                ...baseProps,
                startAt: '2026-03-01T10:00:00Z',
                endAt: '2026-03-01T10:30:00Z'
            });
            expect(r.getDurationHours()).toBe(0.5);
        });
    });

    describe('getFormattedDateRange()', () => {
        it('debe retornar string formateado', () => {
            const r = new Reservation(baseProps);
            const formatted = r.getFormattedDateRange();
            expect(formatted).toContain('-');
            expect(typeof formatted).toBe('string');
        });
    });

    describe('overlaps()', () => {
        it('debe detectar solapamiento completo', () => {
            const r = new Reservation(baseProps);
            expect(r.overlaps('2026-03-01T10:30:00Z', '2026-03-01T11:30:00Z')).toBe(true);
        });

        it('debe detectar solapamiento parcial', () => {
            const r = new Reservation(baseProps);
            expect(r.overlaps('2026-03-01T11:00:00Z', '2026-03-01T13:00:00Z')).toBe(true);
        });

        it('debe retornar false si no se solapan', () => {
            const r = new Reservation(baseProps);
            expect(r.overlaps('2026-03-01T13:00:00Z', '2026-03-01T14:00:00Z')).toBe(false);
        });

        it('debe retornar false si termina justo cuando empieza', () => {
            const r = new Reservation(baseProps);
            expect(r.overlaps('2026-03-01T12:00:00Z', '2026-03-01T13:00:00Z')).toBe(false);
        });
    });

    describe('toJSON()', () => {
        it('debe serializar correctamente', () => {
            const r = new Reservation(baseProps);
            const json = r.toJSON();
            expect(json.id).toBe('r1');
            expect(typeof json.startAt).toBe('string');
            expect(typeof json.endAt).toBe('string');
        });
    });

    describe('fromJSON()', () => {
        it('debe deserializar correctamente', () => {
            const r = Reservation.fromJSON(baseProps);
            expect(r).toBeInstanceOf(Reservation);
            expect(r.id).toBe('r1');
        });

        it('roundtrip debe preservar datos', () => {
            const original = new Reservation(baseProps);
            const restored = Reservation.fromJSON(original.toJSON() as any);
            expect(restored.id).toBe(original.id);
            expect(restored.userId).toBe(original.userId);
            expect(restored.locationId).toBe(original.locationId);
        });
    });
});
