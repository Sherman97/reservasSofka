import { useState, useEffect, useCallback, useRef } from 'react';
import { useReservationDependencies } from '../providers/DependencyProvider';
import type { Subscription } from '../../../core/ports/services/IWebSocketService';

export interface ReminderAlert {
    id: string;
    reservationId: number;
    type: 'reminder_15m' | 'reminder_5m' | 'overdue_10m';
    message: string;
    timestamp: Date;
}

interface UseReminderAlertsReturn {
    alerts: ReminderAlert[];
    hasAlerts: boolean;
    dismissAlert: (alertId: string) => void;
    clearAllAlerts: () => void;
}

/**
 * useReminderAlerts - Hook for WebSocket-based reservation reminders
 * Subscribes to reminder topics from the notifications-service:
 *  - 15 min before end → reminder_15m
 *  - 5 min before end → reminder_5m
 *  - 10 min after end → overdue_10m
 */
export const useReminderAlerts = (): UseReminderAlertsReturn => {
    const { webSocketService } = useReservationDependencies();
    const [alerts, setAlerts] = useState<ReminderAlert[]>([]);
    const subscriptionsRef = useRef<Subscription[]>([]);

    const addAlert = useCallback((type: ReminderAlert['type'], payload: unknown) => {
        const data = payload as Record<string, unknown>;
        const reservationId = data.reservationId as number;
        const message = (data.message as string) || getDefaultMessage(type);

        const alert: ReminderAlert = {
            id: `${type}-${reservationId}-${Date.now()}`,
            reservationId,
            type,
            message,
            timestamp: new Date(),
        };

        setAlerts(prev => {
            // Avoid duplicate alerts for the same reservation and type
            const exists = prev.some(
                a => a.reservationId === reservationId && a.type === type
            );
            if (exists) return prev;
            return [...prev, alert];
        });
    }, []);

    useEffect(() => {
        if (!webSocketService) return;

        webSocketService.connect();

        const sub15m = webSocketService.subscribe(
            '/topic/notifications.reservation.reminder.15m',
            (payload) => addAlert('reminder_15m', payload)
        );

        const sub5m = webSocketService.subscribe(
            '/topic/notifications.reservation.reminder.5m',
            (payload) => addAlert('reminder_5m', payload)
        );

        const subOverdue = webSocketService.subscribe(
            '/topic/notifications.reservation.reminder.overdue.10m',
            (payload) => addAlert('overdue_10m', payload)
        );

        subscriptionsRef.current = [sub15m, sub5m, subOverdue];

        return () => {
            subscriptionsRef.current.forEach(sub => {
                try { sub?.unsubscribe(); } catch (_) { /* ignore */ }
            });
            subscriptionsRef.current = [];
        };
    }, [webSocketService, addAlert]);

    const dismissAlert = useCallback((alertId: string) => {
        setAlerts(prev => prev.filter(a => a.id !== alertId));
    }, []);

    const clearAllAlerts = useCallback(() => {
        setAlerts([]);
    }, []);

    return {
        alerts,
        hasAlerts: alerts.length > 0,
        dismissAlert,
        clearAllAlerts,
    };
};

function getDefaultMessage(type: ReminderAlert['type']): string {
    switch (type) {
        case 'reminder_15m':
            return 'Faltan 15 minutos para finalizar o entregar la reserva.';
        case 'reminder_5m':
            return 'Faltan 5 minutos para finalizar o entregar la reserva.';
        case 'overdue_10m':
            return 'Han pasado 10 minutos desde el fin de la reserva. Registra la entrega/devolución.';
        default:
            return 'Recordatorio de reserva.';
    }
}
