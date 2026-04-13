import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBookingEvents } from './useBookingEvents';

const mockConnect = vi.fn();
const mockSubscribe = vi.fn();
const mockUnsubscribe = vi.fn();

vi.mock('../providers/DependencyProvider', () => ({
    useReservationDependencies: () => ({
        webSocketService: {
            connect: mockConnect,
            subscribe: mockSubscribe
        }
    })
}));

describe('useBookingEvents', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSubscribe.mockReturnValue({ unsubscribe: mockUnsubscribe });
    });

    afterEach(() => { vi.restoreAllMocks(); });

    it('no debe conectar si spaceId es null', () => {
        renderHook(() => useBookingEvents(null, vi.fn()));
        expect(mockConnect).not.toHaveBeenCalled();
        expect(mockSubscribe).not.toHaveBeenCalled();
    });

    it('no debe conectar si spaceId es undefined', () => {
        renderHook(() => useBookingEvents(undefined, vi.fn()));
        expect(mockConnect).not.toHaveBeenCalled();
    });

    it('debe conectar y suscribirse a eventos cuando spaceId está presente', () => {
        renderHook(() => useBookingEvents('space1', vi.fn()));

        expect(mockConnect).toHaveBeenCalled();
        expect(mockSubscribe).toHaveBeenCalledTimes(2);
        expect(mockSubscribe).toHaveBeenCalledWith(
            '/topic/events.bookings.reservation.created',
            expect.any(Function)
        );
        expect(mockSubscribe).toHaveBeenCalledWith(
            '/topic/events.bookings.reservation.cancelled',
            expect.any(Function)
        );
    });

    it('debe desuscribirse al desmontar', () => {
        const { unmount } = renderHook(() => useBookingEvents('space1', vi.fn()));
        unmount();
        expect(mockUnsubscribe).toHaveBeenCalledTimes(2);
    });

    it('debe invocar callback cuando evento coincide con spaceId', () => {
        const callback = vi.fn();
        renderHook(() => useBookingEvents('space1', callback));

        // Get the handler passed to subscribe
        const handler = mockSubscribe.mock.calls[0][1];
        const event = { payload: { spaceId: 'space1' } };

        handler(event);

        expect(callback).toHaveBeenCalledWith(event);
    });

    it('no debe invocar callback cuando evento no coincide con spaceId', () => {
        const callback = vi.fn();
        renderHook(() => useBookingEvents('space1', callback));

        const handler = mockSubscribe.mock.calls[0][1];
        handler({ payload: { spaceId: 'space2' } });

        expect(callback).not.toHaveBeenCalled();
    });

    it('debe manejar eventos con space_id (snake_case)', () => {
        const callback = vi.fn();
        renderHook(() => useBookingEvents('space1', callback));

        const handler = mockSubscribe.mock.calls[0][1];
        handler({ payload: { space_id: 'space1' } });

        expect(callback).toHaveBeenCalled();
    });
});
