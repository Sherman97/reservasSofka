import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReminderAlerts } from './useReminderAlerts';

const mockConnect = vi.fn();
const mockSubscribe = vi.fn();

vi.mock('../providers/DependencyProvider', () => ({
    useReservationDependencies: () => ({
        webSocketService: {
            connect: mockConnect,
            subscribe: mockSubscribe,
        },
        getUserReservationsUseCase: { execute: vi.fn() },
        cancelReservationUseCase: { execute: vi.fn() },
        deliverReservationUseCase: { execute: vi.fn() },
        returnReservationUseCase: { execute: vi.fn() }
    }),
    useAuthDependencies: () => ({
        getCurrentUserUseCase: { execute: vi.fn() }
    })
}));

describe('useReminderAlerts', () => {
    let subscribeCallbacks: Record<string, (payload: unknown) => void>;

    beforeEach(() => {
        vi.clearAllMocks();
        subscribeCallbacks = {};
        mockSubscribe.mockImplementation((topic: string, callback: (payload: unknown) => void) => {
            subscribeCallbacks[topic] = callback;
            return { unsubscribe: vi.fn() };
        });
    });

    it('debe iniciar sin alertas', () => {
        const { result } = renderHook(() => useReminderAlerts());
        expect(result.current.alerts).toEqual([]);
        expect(result.current.hasAlerts).toBe(false);
    });

    it('debe llamar a connect en el webSocketService', () => {
        renderHook(() => useReminderAlerts());
        expect(mockConnect).toHaveBeenCalled();
    });

    it('debe subscribirse a los 3 topics de recordatorio', () => {
        renderHook(() => useReminderAlerts());
        expect(mockSubscribe).toHaveBeenCalledTimes(3);
        expect(mockSubscribe).toHaveBeenCalledWith(
            '/topic/notifications.reservation.reminder.15m',
            expect.any(Function)
        );
        expect(mockSubscribe).toHaveBeenCalledWith(
            '/topic/notifications.reservation.reminder.5m',
            expect.any(Function)
        );
        expect(mockSubscribe).toHaveBeenCalledWith(
            '/topic/notifications.reservation.reminder.overdue.10m',
            expect.any(Function)
        );
    });

    it('debe agregar una alerta cuando llega un mensaje de reminder_15m', () => {
        const { result } = renderHook(() => useReminderAlerts());

        act(() => {
            subscribeCallbacks['/topic/notifications.reservation.reminder.15m']({
                reservationId: 42,
                message: 'Faltan 15 minutos'
            });
        });

        expect(result.current.alerts).toHaveLength(1);
        expect(result.current.alerts[0].type).toBe('reminder_15m');
        expect(result.current.alerts[0].reservationId).toBe(42);
        expect(result.current.alerts[0].message).toBe('Faltan 15 minutos');
        expect(result.current.hasAlerts).toBe(true);
    });

    it('debe agregar una alerta cuando llega un mensaje de reminder_5m', () => {
        const { result } = renderHook(() => useReminderAlerts());

        act(() => {
            subscribeCallbacks['/topic/notifications.reservation.reminder.5m']({
                reservationId: 10,
                message: 'Faltan 5 minutos'
            });
        });

        expect(result.current.alerts).toHaveLength(1);
        expect(result.current.alerts[0].type).toBe('reminder_5m');
    });

    it('debe agregar una alerta cuando llega un mensaje de overdue_10m', () => {
        const { result } = renderHook(() => useReminderAlerts());

        act(() => {
            subscribeCallbacks['/topic/notifications.reservation.reminder.overdue.10m']({
                reservationId: 99,
                message: 'Vencida hace 10 minutos'
            });
        });

        expect(result.current.alerts).toHaveLength(1);
        expect(result.current.alerts[0].type).toBe('overdue_10m');
    });

    it('debe usar mensaje por defecto si payload no trae message', () => {
        const { result } = renderHook(() => useReminderAlerts());

        act(() => {
            subscribeCallbacks['/topic/notifications.reservation.reminder.15m']({
                reservationId: 1
            });
        });

        expect(result.current.alerts[0].message).toBe(
            'Faltan 15 minutos para finalizar o entregar la reserva.'
        );
    });

    it('debe usar mensaje por defecto para 5m', () => {
        const { result } = renderHook(() => useReminderAlerts());

        act(() => {
            subscribeCallbacks['/topic/notifications.reservation.reminder.5m']({
                reservationId: 2
            });
        });

        expect(result.current.alerts[0].message).toBe(
            'Faltan 5 minutos para finalizar o entregar la reserva.'
        );
    });

    it('debe usar mensaje por defecto para overdue', () => {
        const { result } = renderHook(() => useReminderAlerts());

        act(() => {
            subscribeCallbacks['/topic/notifications.reservation.reminder.overdue.10m']({
                reservationId: 3
            });
        });

        expect(result.current.alerts[0].message).toBe(
            'Han pasado 10 minutos desde el fin de la reserva. Registra la entrega/devolución.'
        );
    });

    it('debe evitar alertas duplicadas para misma reserva y tipo', () => {
        const { result } = renderHook(() => useReminderAlerts());

        act(() => {
            subscribeCallbacks['/topic/notifications.reservation.reminder.15m']({
                reservationId: 42,
                message: 'Recuerdo 1'
            });
        });

        act(() => {
            subscribeCallbacks['/topic/notifications.reservation.reminder.15m']({
                reservationId: 42,
                message: 'Recuerdo duplicado'
            });
        });

        expect(result.current.alerts).toHaveLength(1);
    });

    it('debe permitir alertas del mismo reservationId con diferente tipo', () => {
        const { result } = renderHook(() => useReminderAlerts());

        act(() => {
            subscribeCallbacks['/topic/notifications.reservation.reminder.15m']({
                reservationId: 42,
                message: '15 min'
            });
        });

        act(() => {
            subscribeCallbacks['/topic/notifications.reservation.reminder.5m']({
                reservationId: 42,
                message: '5 min'
            });
        });

        expect(result.current.alerts).toHaveLength(2);
    });

    it('debe descartar una alerta individual con dismissAlert', () => {
        const { result } = renderHook(() => useReminderAlerts());

        act(() => {
            subscribeCallbacks['/topic/notifications.reservation.reminder.15m']({
                reservationId: 1,
                message: 'Alerta 1'
            });
        });

        act(() => {
            subscribeCallbacks['/topic/notifications.reservation.reminder.5m']({
                reservationId: 2,
                message: 'Alerta 2'
            });
        });

        expect(result.current.alerts).toHaveLength(2);

        const alertToRemove = result.current.alerts[0].id;
        act(() => {
            result.current.dismissAlert(alertToRemove);
        });

        expect(result.current.alerts).toHaveLength(1);
        expect(result.current.alerts[0].reservationId).toBe(2);
    });

    it('debe limpiar todas las alertas con clearAllAlerts', () => {
        const { result } = renderHook(() => useReminderAlerts());

        act(() => {
            subscribeCallbacks['/topic/notifications.reservation.reminder.15m']({
                reservationId: 1,
                message: 'Alerta 1'
            });
        });

        act(() => {
            subscribeCallbacks['/topic/notifications.reservation.reminder.5m']({
                reservationId: 2,
                message: 'Alerta 2'
            });
        });

        expect(result.current.alerts).toHaveLength(2);

        act(() => {
            result.current.clearAllAlerts();
        });

        expect(result.current.alerts).toHaveLength(0);
        expect(result.current.hasAlerts).toBe(false);
    });

    it('debe desubscribirse al desmontar el hook', () => {
        const unsubFns = [vi.fn(), vi.fn(), vi.fn()];
        let callIdx = 0;
        mockSubscribe.mockImplementation((topic: string, cb: (payload: unknown) => void) => {
            subscribeCallbacks[topic] = cb;
            return { unsubscribe: unsubFns[callIdx++] };
        });

        const { unmount } = renderHook(() => useReminderAlerts());
        unmount();

        unsubFns.forEach(fn => expect(fn).toHaveBeenCalled());
    });
});
