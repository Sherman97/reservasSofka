import { useEffect, useRef } from 'react';
import { useReservationDependencies } from '../providers/DependencyProvider';
import type { Subscription } from '../../../core/ports/services/IWebSocketService';

export const useBookingEvents = (spaceId: string | null | undefined, onBookingChange: (event: unknown) => void): void => {
    const { webSocketService } = useReservationDependencies();
    const subscriptionsRef = useRef<Subscription[]>([]);
    const callbackRef = useRef(onBookingChange);

    useEffect(() => { callbackRef.current = onBookingChange; }, [onBookingChange]);

    useEffect(() => {
        if (!webSocketService || !spaceId) return;
        webSocketService.connect();

        const handleEvent = (event: unknown): void => {
            const payload = (event as { payload?: Record<string, unknown> }).payload || event;
            const eventSpaceId = (payload as Record<string, unknown>).spaceId || (payload as Record<string, unknown>).space_id;
            if (eventSpaceId && String(eventSpaceId) === String(spaceId)) {
                console.log('[BookingEvents] Relevant booking change detected for space', spaceId, event);
                if (callbackRef.current) callbackRef.current(event);
            }
        };

        const sub1 = webSocketService.subscribe('/topic/events.bookings.reservation.created', handleEvent);
        const sub2 = webSocketService.subscribe('/topic/events.bookings.reservation.cancelled', handleEvent);
        subscriptionsRef.current = [sub1, sub2];

        return () => {
            subscriptionsRef.current.forEach(sub => { try { sub?.unsubscribe(); } catch (_) { /* ignore */ } });
            subscriptionsRef.current = [];
        };
    }, [webSocketService, spaceId]);
};
