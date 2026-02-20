import { describe, it, expect } from 'vitest';
import { Reservation } from './Reservation';

describe('Reservation - Domain Entity', () => {
    const now = new Date();
    const futureStart = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +1 day
    const futureEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);   // +25h
    const pastStart = new Date(now.getTime() - 48 * 60 * 60 * 1000);   // -2 days
    const pastEnd = new Date(now.getTime() - 47 * 60 * 60 * 1000);     // -47h

    const makeReservation = (overrides = {}) =>
        new Reservation({
            id: 'res-1',
            userId: 'user-1',
            locationId: 'loc-1',
            locationName: 'Sala Principal',
            startAt: futureStart.toISOString(),
            endAt: futureEnd.toISOString(),
            equipment: [],
            status: 'active',
            ...overrides,
        });

    describe('constructor', () => {
        it('should create a reservation with correct properties', () => {
            const res = makeReservation();
            expect(res.id).toBe('res-1');
            expect(res.userId).toBe('user-1');
            expect(res.locationId).toBe('loc-1');
            expect(res.locationName).toBe('Sala Principal');
            expect(res.startAt).toBeInstanceOf(Date);
            expect(res.endAt).toBeInstanceOf(Date);
            expect(res.status).toBe('active');
        });

        it('should default status to "active"', () => {
            const res = new Reservation({
                id: '1', userId: 'u1', locationId: 'l1',
                locationName: 'Test', startAt: futureStart, endAt: futureEnd,
            });
            expect(res.status).toBe('active');
        });

        it('should default createdAt to now when not provided', () => {
            const res = makeReservation();
            expect(res.createdAt).toBeInstanceOf(Date);
        });
    });

    describe('status methods', () => {
        it('isActive returns true for active status', () => {
            expect(makeReservation({ status: 'active' }).isActive()).toBe(true);
        });

        it('isActive returns true for confirmed status', () => {
            expect(makeReservation({ status: 'confirmed' }).isActive()).toBe(true);
        });

        it('isActive returns true for pending status', () => {
            expect(makeReservation({ status: 'pending' }).isActive()).toBe(true);
        });

        it('isActive returns true for created status', () => {
            expect(makeReservation({ status: 'created' }).isActive()).toBe(true);
        });

        it('isActive returns false for cancelled', () => {
            expect(makeReservation({ status: 'cancelled' }).isActive()).toBe(false);
        });

        it('isCancelled returns true when status is cancelled', () => {
            expect(makeReservation({ status: 'cancelled' }).isCancelled()).toBe(true);
        });

        it('isCancelled returns false when status is active', () => {
            expect(makeReservation({ status: 'active' }).isCancelled()).toBe(false);
        });
    });

    describe('time-based methods', () => {
        it('isPast returns true for past reservations', () => {
            const res = makeReservation({ startAt: pastStart, endAt: pastEnd });
            expect(res.isPast()).toBe(true);
        });

        it('isPast returns false for future reservations', () => {
            const res = makeReservation();
            expect(res.isPast()).toBe(false);
        });

        it('isUpcoming returns true for future active reservations', () => {
            expect(makeReservation().isUpcoming()).toBe(true);
        });

        it('isUpcoming returns false for cancelled reservations', () => {
            expect(makeReservation({ status: 'cancelled' }).isUpcoming()).toBe(false);
        });

        it('isUpcoming returns false for past reservations', () => {
            const res = makeReservation({ startAt: pastStart, endAt: pastEnd });
            expect(res.isUpcoming()).toBe(false);
        });

        it('isOngoing returns true when current time is within range', () => {
            const start = new Date(now.getTime() - 30 * 60 * 1000); // 30min ago
            const end = new Date(now.getTime() + 30 * 60 * 1000);   // 30min from now
            const res = makeReservation({ startAt: start, endAt: end });
            expect(res.isOngoing()).toBe(true);
        });

        it('isOngoing returns false for cancelled even if in range', () => {
            const start = new Date(now.getTime() - 30 * 60 * 1000);
            const end = new Date(now.getTime() + 30 * 60 * 1000);
            const res = makeReservation({ startAt: start, endAt: end, status: 'cancelled' });
            expect(res.isOngoing()).toBe(false);
        });
    });

    describe('getDurationHours', () => {
        it('should calculate duration correctly', () => {
            const start = new Date('2026-03-01T10:00:00');
            const end = new Date('2026-03-01T12:30:00');
            const res = makeReservation({ startAt: start, endAt: end });
            expect(res.getDurationHours()).toBe(2.5);
        });
    });

    describe('overlaps', () => {
        it('should detect overlapping time ranges', () => {
            const res = makeReservation({
                startAt: new Date('2026-03-01T10:00:00'),
                endAt: new Date('2026-03-01T12:00:00'),
            });
            expect(res.overlaps('2026-03-01T11:00:00', '2026-03-01T13:00:00')).toBe(true);
        });

        it('should not detect non-overlapping time ranges', () => {
            const res = makeReservation({
                startAt: new Date('2026-03-01T10:00:00'),
                endAt: new Date('2026-03-01T12:00:00'),
            });
            expect(res.overlaps('2026-03-01T13:00:00', '2026-03-01T14:00:00')).toBe(false);
        });

        it('should not overlap when end equals start', () => {
            const res = makeReservation({
                startAt: new Date('2026-03-01T10:00:00'),
                endAt: new Date('2026-03-01T12:00:00'),
            });
            expect(res.overlaps('2026-03-01T12:00:00', '2026-03-01T13:00:00')).toBe(false);
        });
    });

    describe('serialization', () => {
        it('should serialize to JSON with ISO dates', () => {
            const res = makeReservation();
            const json = res.toJSON();
            expect(json.id).toBe('res-1');
            expect(typeof json.startAt).toBe('string');
            expect(typeof json.endAt).toBe('string');
            expect(typeof json.createdAt).toBe('string');
        });

        it('should deserialize from JSON', () => {
            const json = makeReservation().toJSON();
            const res = Reservation.fromJSON(json);
            expect(res).toBeInstanceOf(Reservation);
            expect(res.id).toBe('res-1');
            expect(res.startAt).toBeInstanceOf(Date);
        });
    });
});
