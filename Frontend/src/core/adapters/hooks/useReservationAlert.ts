import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Reservation } from '../../../core/domain/entities/Reservation';

const CHECK_INTERVAL_MS = 60_000; // Check every minute

interface UseReservationAlertReturn {
    expiringReservations: Reservation[];
    hasAlerts: boolean;
    dismissAlert: (reservationId: string) => void;
}

export const useReservationAlert = (
    reservations: Reservation[],
    thresholdMinutes: number = 2
): UseReservationAlertReturn => {
    const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
    const [, setTick] = useState(0); // force re-render on interval

    // Periodic check
    useEffect(() => {
        const interval = setInterval(() => {
            setTick((t) => t + 1);
        }, CHECK_INTERVAL_MS);

        return () => clearInterval(interval);
    }, []);

    const dismissAlert = useCallback((reservationId: string) => {
        setDismissedIds((prev) => {
            const next = new Set(prev);
            next.add(reservationId);
            return next;
        });
    }, []);

    const expiringReservations = useMemo(() => {
        if (!reservations || reservations.length === 0) return [];

        return reservations.filter((r) => {
            if (dismissedIds.has(r.id)) return false;
            return r.isAboutToExpire(thresholdMinutes);
        });
    }, [reservations, thresholdMinutes, dismissedIds]);

    return {
        expiringReservations,
        hasAlerts: expiringReservations.length > 0,
        dismissAlert,
    };
};
