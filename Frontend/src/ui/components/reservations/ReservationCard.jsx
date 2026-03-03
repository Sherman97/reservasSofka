import React, { useState, useEffect } from 'react';
import '../../styles/reservations/Reservations.css';

/**
 * ReservationCard - UI Component
 * Displays a single reservation with details and actions.
 * Automatically transitions status from "Próxima" to "En Progreso" when startAt arrives.
 */
export const ReservationCard = ({ reservation, onCancel, onDeliver, onReturn }) => {
    // Periodic re-render to detect time-based status transitions
    const [, setTick] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 30_000);
        return () => clearInterval(interval);
    }, []);

    const isUpcoming = reservation.isUpcoming();
    const isCancelled = reservation.isCancelled();
    const isPast = reservation.isPast();
    const isInProgress = reservation.isInProgress();
    const isCompleted = reservation.isCompleted();
    const isOngoing = reservation.isOngoing();

    const getStatusClass = () => {
        if (isCancelled) return 'res-status-cancelled';
        if (isInProgress) return 'res-status-in-progress';
        if (isCompleted) return 'res-status-completed';
        if (isOngoing) return 'res-status-in-progress';
        if (isUpcoming) return 'res-status-upcoming';
        if (isPast) return 'res-status-past';
        return 'res-status-active';
    };

    const getStatusText = () => {
        if (isCancelled) return 'Cancelada';
        if (isInProgress) return 'En Progreso';
        if (isCompleted) return 'Completada';
        if (isOngoing) return 'En Progreso';
        if (isUpcoming) return 'Próxima';
        if (isPast) return 'Pasada';
        return 'En curso';
    };

    // Determine icon based on type or name
    let icon = '📅';
    const name = (reservation.locationName || '').toLowerCase();
    if (name.includes('sala') || name.includes('reunión')) icon = '🏢';
    if (name.includes('laptop') || name.includes('macbook')) icon = '💻';
    if (name.includes('kit') || name.includes('cámara')) icon = '📹';

    return (
        <div className={`reservation-card ${isCancelled ? 'cancelled' : ''}`}>
            <div className="card-left">
                <div className="card-icon-container">
                    <span className="card-icon">{icon}</span>
                </div>
                <div className="card-details">
                    <h3 className="card-title">{reservation.locationName}</h3>
                    <p className="card-subtitle">ID: {reservation.id}</p>
                </div>
            </div>

            <div className="card-middle">
                <div className="card-date-info">
                    <span className="calendar-icon">🕒</span>
                    <div className="date-text">
                        <span className="date-main">
                            {reservation.startAt.toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                        <span className="date-sub">
                            {reservation.startAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} -
                            {reservation.endAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>
            </div>

            <div className="card-right">
                <span className={`res-status-badge ${getStatusClass()}`}>
                    {getStatusText()}
                </span>

                <div className="card-actions">
                    {/* Deliver button: available only when reservation is in progress (ongoing) */}
                    {(isInProgress || isOngoing) && !isCancelled && !isCompleted && onDeliver && (
                        <button
                            className="btn-deliver-res"
                            onClick={() => onDeliver(reservation)}
                            title="Registrar Entrega"
                        >
                            📦
                        </button>
                    )}

                    {/* Return button: available when reservation is in_progress */}
                    {isInProgress && onReturn && (
                        <button
                            className="btn-return-res"
                            onClick={() => onReturn(reservation)}
                            title="Registrar Devolución"
                        >
                            ✅
                        </button>
                    )}

                    {isUpcoming && !isCancelled && (
                        <button
                            className="btn-cancel-res"
                            onClick={() => onCancel(reservation.id)}
                            title="Cancelar Reserva"
                        >
                            🗑️
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
