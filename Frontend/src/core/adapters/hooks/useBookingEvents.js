import { useEffect, useRef } from 'react';
import { useReservationDependencies } from './useDependencies';

/**
 * useBookingEvents - Adapter Hook
 * Subscribes to real-time booking events via WebSocket (STOMP)
 * 
 * Listens to:
 *   /topic/events.bookings.reservation.created
 *   /topic/events.bookings.reservation.cancelled
 * 
 * When a booking event is received for the same spaceId,
 * it triggers a callback so the UI can refresh availability.
 */
export const useBookingEvents = (spaceId, onBookingChange) => {
    const { webSocketService } = useReservationDependencies();
    const subscriptionsRef = useRef([]);
    const callbackRef = useRef(onBookingChange);

    // Keep callback ref updated
    useEffect(() => {
        callbackRef.current = onBookingChange;
    }, [onBookingChange]);

    useEffect(() => {
        if (!webSocketService || !spaceId) return;

        // Connect if not already connected
        webSocketService.connect();

        const handleEvent = (event) => {
            // event shape from backend: { routingKey, channel, payload, occurredAt }
            const payload = event.payload || event;
            const eventSpaceId = payload.spaceId || payload.space_id;

            // Only react if this event is for our space
            if (eventSpaceId && String(eventSpaceId) === String(spaceId)) {
                console.log('[BookingEvents] Relevant booking change detected for space', spaceId, event);
                if (callbackRef.current) {
                    callbackRef.current(event);
                }
            }
        };

        // Subscribe to specific booking event topics
        const sub1 = webSocketService.subscribe(
            '/topic/events.bookings.reservation.created',
            handleEvent
        );
        const sub2 = webSocketService.subscribe(
            '/topic/events.bookings.reservation.cancelled',
            handleEvent
        );

        subscriptionsRef.current = [sub1, sub2];

        return () => {
            // Cleanup subscriptions on unmount or spaceId change
            subscriptionsRef.current.forEach(sub => {
                try { sub?.unsubscribe(); } catch (_error) { /* ignore */ }
            });
            subscriptionsRef.current = [];
        };
    }, [webSocketService, spaceId]);
};
