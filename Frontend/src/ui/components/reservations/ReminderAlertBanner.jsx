import React from 'react';
import '../../styles/reservations/ReminderAlerts.css';

/**
 * ReminderAlertBanner - UI Component
 * Displays real-time reminder alerts from WebSocket notifications
 * about reservations that are about to end or overdue.
 */
export const ReminderAlertBanner = ({ alerts, onDismiss, onClearAll }) => {
    if (!alerts || alerts.length === 0) return null;

    const getAlertClass = (type) => {
        switch (type) {
            case 'reminder_15m': return 'alert-warning';
            case 'reminder_5m': return 'alert-urgent';
            case 'overdue_10m': return 'alert-danger';
            default: return 'alert-info';
        }
    };

    const getAlertIcon = (type) => {
        switch (type) {
            case 'reminder_15m': return '⏰';
            case 'reminder_5m': return '⚠️';
            case 'overdue_10m': return '🚨';
            default: return '🔔';
        }
    };

    const getAlertLabel = (type) => {
        switch (type) {
            case 'reminder_15m': return '15 min';
            case 'reminder_5m': return '5 min';
            case 'overdue_10m': return 'Vencida';
            default: return 'Alerta';
        }
    };

    return (
        <div className="reminder-alerts-container">
            <div className="reminder-alerts-header">
                <span className="reminder-alerts-title">🔔 Recordatorios ({alerts.length})</span>
                {alerts.length > 1 && (
                    <button className="btn-clear-all" onClick={onClearAll}>
                        Limpiar todos
                    </button>
                )}
            </div>
            <div className="reminder-alerts-list">
                {alerts.map((alert) => (
                    <div key={alert.id} className={`reminder-alert ${getAlertClass(alert.type)}`}>
                        <span className="alert-icon">{getAlertIcon(alert.type)}</span>
                        <div className="alert-content">
                            <span className="alert-badge">{getAlertLabel(alert.type)}</span>
                            <p className="alert-message">{alert.message}</p>
                            <span className="alert-reservation">Reserva #{alert.reservationId}</span>
                        </div>
                        <button
                            className="alert-dismiss"
                            onClick={() => onDismiss(alert.id)}
                            title="Descartar"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
