import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReservationAlert } from './useReservationAlert';
import { Reservation } from '../../../core/domain/entities/Reservation';

describe('useReservationAlert', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('debe retornar alertas vacías cuando no hay reservas activas', () => {
        const { result } = renderHook(() => useReservationAlert([]));

        expect(result.current.expiringReservations).toEqual([]);
        expect(result.current.hasAlerts).toBe(false);
    });

    it('debe detectar una reserva que está a punto de expirar', () => {
        const now = new Date('2026-02-26T10:58:30');
        vi.setSystemTime(now);

        const reservation = new Reservation({
            id: 'r1',
            userId: 'u1',
            locationId: 'l1',
            locationName: 'Sala A',
            startAt: '2026-02-26T10:00:00',
            endAt: '2026-02-26T11:00:00',
            status: 'active',
        });

        const { result } = renderHook(() => useReservationAlert([reservation]));

        expect(result.current.expiringReservations).toHaveLength(1);
        expect(result.current.expiringReservations[0].id).toBe('r1');
        expect(result.current.hasAlerts).toBe(true);
    });

    it('no debe alertar reservas con suficiente tiempo restante', () => {
        const now = new Date('2026-02-26T10:00:00');
        vi.setSystemTime(now);

        const reservation = new Reservation({
            id: 'r2',
            userId: 'u1',
            locationId: 'l1',
            locationName: 'Sala B',
            startAt: '2026-02-26T10:00:00',
            endAt: '2026-02-26T11:00:00',
            status: 'active',
        });

        const { result } = renderHook(() => useReservationAlert([reservation]));

        expect(result.current.expiringReservations).toHaveLength(0);
        expect(result.current.hasAlerts).toBe(false);
    });

    it('no debe alertar reservas canceladas', () => {
        const now = new Date('2026-02-26T10:55:00');
        vi.setSystemTime(now);

        const reservation = new Reservation({
            id: 'r3',
            userId: 'u1',
            locationId: 'l1',
            locationName: 'Sala C',
            startAt: '2026-02-26T10:00:00',
            endAt: '2026-02-26T11:00:00',
            status: 'cancelled',
        });

        const { result } = renderHook(() => useReservationAlert([reservation]));

        expect(result.current.expiringReservations).toHaveLength(0);
    });

    it('debe permitir descartar una alerta', () => {
        const now = new Date('2026-02-26T10:58:30');
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

        const { result } = renderHook(() => useReservationAlert([reservation]));

        expect(result.current.expiringReservations).toHaveLength(1);

        act(() => {
            result.current.dismissAlert('r4');
        });

        expect(result.current.expiringReservations).toHaveLength(0);
        expect(result.current.hasAlerts).toBe(false);
    });

    it('debe usar umbral personalizado de minutos', () => {
        const now = new Date('2026-02-26T10:42:00');
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

        // Con umbral de 20 min, quedan 18 => debe alertar
        const { result } = renderHook(() => useReservationAlert([reservation], 20));

        expect(result.current.expiringReservations).toHaveLength(1);
        expect(result.current.hasAlerts).toBe(true);
    });

    it('debe actualizar periódicamente verificando las reservas', () => {
        const now = new Date('2026-02-26T10:40:00');
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

        const { result } = renderHook(() => useReservationAlert([reservation]));

        // Con 20 min restantes, umbral default 2, no alerta
        expect(result.current.hasAlerts).toBe(false);

        // Avanzar reloj a 10:58:30 (~1.5 min restantes)
        act(() => {
            vi.setSystemTime(new Date('2026-02-26T10:58:30'));
            vi.advanceTimersByTime(60000); // trigger interval
        });

        expect(result.current.hasAlerts).toBe(true);
    });
});
