import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Reservation } from './Reservation';

describe('Reservation - Alert de expiración', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('getRemainingMinutes() debe retornar minutos restantes cuando la reserva está en curso', () => {
        const now = new Date('2026-02-26T10:00:00');
        vi.setSystemTime(now);

        const reservation = new Reservation({
            id: 'r1',
            userId: 'u1',
            locationId: 'l1',
            locationName: 'Sala A',
            startAt: '2026-02-26T09:00:00',
            endAt: '2026-02-26T10:30:00',
            status: 'active',
        });

        expect(reservation.getRemainingMinutes()).toBe(30);
    });

    it('getRemainingMinutes() debe retornar 0 si la reserva ya terminó', () => {
        const now = new Date('2026-02-26T12:00:00');
        vi.setSystemTime(now);

        const reservation = new Reservation({
            id: 'r2',
            userId: 'u1',
            locationId: 'l1',
            locationName: 'Sala B',
            startAt: '2026-02-26T09:00:00',
            endAt: '2026-02-26T11:00:00',
            status: 'active',
        });

        expect(reservation.getRemainingMinutes()).toBe(0);
    });

    it('getRemainingMinutes() debe retornar minutos totales si la reserva aún no empieza', () => {
        const now = new Date('2026-02-26T08:00:00');
        vi.setSystemTime(now);

        const reservation = new Reservation({
            id: 'r3',
            userId: 'u1',
            locationId: 'l1',
            locationName: 'Sala C',
            startAt: '2026-02-26T09:00:00',
            endAt: '2026-02-26T10:00:00',
            status: 'active',
        });

        // Aún no inicia, retorna tiempo desde ahora hasta el fin
        expect(reservation.getRemainingMinutes()).toBe(120);
    });

    it('isAboutToExpire(threshold) debe retornar true cuando quedan menos minutos que el umbral', () => {
        const now = new Date('2026-02-26T10:50:00');
        vi.setSystemTime(now);

        const reservation = new Reservation({
            id: 'r4',
            userId: 'u1',
            locationId: 'l1',
            locationName: 'Sala D',
            startAt: '2026-02-26T10:00:00',
            endAt: '2026-02-26T11:00:00',
            status: 'active',
        });

        // Quedan 10 min, umbral 15 => true
        expect(reservation.isAboutToExpire(15)).toBe(true);
    });

    it('isAboutToExpire(threshold) debe retornar false cuando quedan más minutos que el umbral', () => {
        const now = new Date('2026-02-26T10:30:00');
        vi.setSystemTime(now);

        const reservation = new Reservation({
            id: 'r5',
            userId: 'u1',
            locationId: 'l1',
            locationName: 'Sala E',
            startAt: '2026-02-26T10:00:00',
            endAt: '2026-02-26T11:00:00',
            status: 'active',
        });

        // Quedan 30 min, umbral 15 => false
        expect(reservation.isAboutToExpire(15)).toBe(false);
    });

    it('isAboutToExpire() debe usar umbral por defecto de 10 minutos', () => {
        const now = new Date('2026-02-26T10:52:00');
        vi.setSystemTime(now);

        const reservation = new Reservation({
            id: 'r6',
            userId: 'u1',
            locationId: 'l1',
            locationName: 'Sala F',
            startAt: '2026-02-26T10:00:00',
            endAt: '2026-02-26T11:00:00',
            status: 'active',
        });

        // Quedan 8 min, umbral default 10 => true
        expect(reservation.isAboutToExpire()).toBe(true);
    });

    it('isAboutToExpire() debe retornar false para reservas canceladas', () => {
        const now = new Date('2026-02-26T10:55:00');
        vi.setSystemTime(now);

        const reservation = new Reservation({
            id: 'r7',
            userId: 'u1',
            locationId: 'l1',
            locationName: 'Sala G',
            startAt: '2026-02-26T10:00:00',
            endAt: '2026-02-26T11:00:00',
            status: 'cancelled',
        });

        expect(reservation.isAboutToExpire(15)).toBe(false);
    });

    it('isAboutToExpire() debe retornar false para reservas ya finalizadas', () => {
        const now = new Date('2026-02-26T12:00:00');
        vi.setSystemTime(now);

        const reservation = new Reservation({
            id: 'r8',
            userId: 'u1',
            locationId: 'l1',
            locationName: 'Sala H',
            startAt: '2026-02-26T10:00:00',
            endAt: '2026-02-26T11:00:00',
            status: 'active',
        });

        expect(reservation.isAboutToExpire(15)).toBe(false);
    });
});

describe('Reservation - Status Methods', () => {
    it('isInProgress() debe retornar true para status in_progress', () => {
        const reservation = new Reservation({
            id: 'r1', userId: 'u1', locationId: 'l1', locationName: 'Sala A',
            startAt: '2026-02-26T10:00:00', endAt: '2026-02-26T11:00:00',
            status: 'in_progress',
        });
        expect(reservation.isInProgress()).toBe(true);
    });

    it('isInProgress() debe retornar false para status active', () => {
        const reservation = new Reservation({
            id: 'r2', userId: 'u1', locationId: 'l1', locationName: 'Sala B',
            startAt: '2026-02-26T10:00:00', endAt: '2026-02-26T11:00:00',
            status: 'active',
        });
        expect(reservation.isInProgress()).toBe(false);
    });

    it('isConfirmed() debe retornar true para status confirmed', () => {
        const reservation = new Reservation({
            id: 'r3', userId: 'u1', locationId: 'l1', locationName: 'Sala C',
            startAt: '2026-02-26T10:00:00', endAt: '2026-02-26T11:00:00',
            status: 'confirmed',
        });
        expect(reservation.isConfirmed()).toBe(true);
    });

    it('isConfirmed() debe retornar true para status active', () => {
        const reservation = new Reservation({
            id: 'r4', userId: 'u1', locationId: 'l1', locationName: 'Sala D',
            startAt: '2026-02-26T10:00:00', endAt: '2026-02-26T11:00:00',
            status: 'active',
        });
        expect(reservation.isConfirmed()).toBe(true);
    });

    it('isConfirmed() debe retornar true para status pending', () => {
        const reservation = new Reservation({
            id: 'r5', userId: 'u1', locationId: 'l1', locationName: 'Sala E',
            startAt: '2026-02-26T10:00:00', endAt: '2026-02-26T11:00:00',
            status: 'pending',
        });
        expect(reservation.isConfirmed()).toBe(true);
    });

    it('isConfirmed() debe retornar true para status created', () => {
        const reservation = new Reservation({
            id: 'r6', userId: 'u1', locationId: 'l1', locationName: 'Sala F',
            startAt: '2026-02-26T10:00:00', endAt: '2026-02-26T11:00:00',
            status: 'created',
        });
        expect(reservation.isConfirmed()).toBe(true);
    });

    it('isConfirmed() debe retornar false para status cancelled', () => {
        const reservation = new Reservation({
            id: 'r7', userId: 'u1', locationId: 'l1', locationName: 'Sala G',
            startAt: '2026-02-26T10:00:00', endAt: '2026-02-26T11:00:00',
            status: 'cancelled',
        });
        expect(reservation.isConfirmed()).toBe(false);
    });

    it('isConfirmed() debe retornar false para status in_progress', () => {
        const reservation = new Reservation({
            id: 'r8', userId: 'u1', locationId: 'l1', locationName: 'Sala H',
            startAt: '2026-02-26T10:00:00', endAt: '2026-02-26T11:00:00',
            status: 'in_progress',
        });
        expect(reservation.isConfirmed()).toBe(false);
    });

    it('isCompleted() debe retornar true para status completed', () => {
        const reservation = new Reservation({
            id: 'r9', userId: 'u1', locationId: 'l1', locationName: 'Sala I',
            startAt: '2026-02-26T10:00:00', endAt: '2026-02-26T11:00:00',
            status: 'completed',
        });
        expect(reservation.isCompleted()).toBe(true);
    });

    it('isCompleted() debe retornar false para status active', () => {
        const reservation = new Reservation({
            id: 'r10', userId: 'u1', locationId: 'l1', locationName: 'Sala J',
            startAt: '2026-02-26T10:00:00', endAt: '2026-02-26T11:00:00',
            status: 'active',
        });
        expect(reservation.isCompleted()).toBe(false);
    });

    it('isActive() debe incluir in_progress', () => {
        const reservation = new Reservation({
            id: 'r11', userId: 'u1', locationId: 'l1', locationName: 'Sala K',
            startAt: '2026-02-26T10:00:00', endAt: '2026-02-26T11:00:00',
            status: 'in_progress',
        });
        expect(reservation.isActive()).toBe(true);
    });

    it('isActive() debe retornar false para completed', () => {
        const reservation = new Reservation({
            id: 'r12', userId: 'u1', locationId: 'l1', locationName: 'Sala L',
            startAt: '2026-02-26T10:00:00', endAt: '2026-02-26T11:00:00',
            status: 'completed',
        });
        expect(reservation.isActive()).toBe(false);
    });

    it('isActive() debe retornar false para status desconocido', () => {
        const reservation = new Reservation({
            id: 'r13', userId: 'u1', locationId: 'l1', locationName: 'Sala M',
            startAt: '2026-02-26T10:00:00', endAt: '2026-02-26T11:00:00',
            status: 'unknown_status',
        });
        expect(reservation.isActive()).toBe(false);
    });

    it('isInProgress() debe retornar false para completed', () => {
        const reservation = new Reservation({
            id: 'r14', userId: 'u1', locationId: 'l1', locationName: 'Sala N',
            startAt: '2026-02-26T10:00:00', endAt: '2026-02-26T11:00:00',
            status: 'completed',
        });
        expect(reservation.isInProgress()).toBe(false);
    });

    it('isCompleted() debe retornar false para in_progress', () => {
        const reservation = new Reservation({
            id: 'r15', userId: 'u1', locationId: 'l1', locationName: 'Sala O',
            startAt: '2026-02-26T10:00:00', endAt: '2026-02-26T11:00:00',
            status: 'in_progress',
        });
        expect(reservation.isCompleted()).toBe(false);
    });

    it('isConfirmed() debe retornar false para completed', () => {
        const reservation = new Reservation({
            id: 'r16', userId: 'u1', locationId: 'l1', locationName: 'Sala P',
            startAt: '2026-02-26T10:00:00', endAt: '2026-02-26T11:00:00',
            status: 'completed',
        });
        expect(reservation.isConfirmed()).toBe(false);
    });
});
