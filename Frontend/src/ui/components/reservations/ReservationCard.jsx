import React, { useState, useEffect } from 'react';
import { FaBuilding, FaLaptop, FaVideo, FaCalendarAlt, FaClock, FaBox, FaCheckCircle, FaEdit, FaTrash, FaQrcode } from 'react-icons/fa';
import '../../styles/reservations/Reservations.css';

/**
 * ReservationCard - UI Component
 * Displays a single reservation with details and actions.
 * Automatically transitions status from "Proxima" to "En Progreso" when startAt arrives.
 */
export const ReservationCard = ({ reservation, onCancel, onEdit, onDeliver, onReturn, onScanQR }) => {
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
    const isCheckedIn = reservation.isCheckedIn ? reservation.isCheckedIn() : (reservation.status || '').toLowerCase() === 'checked_in';
    const isOngoing = reservation.isOngoing();

    const getStatusClass = () => {
        if (isCancelled) return 'res-status-cancelled';
        if (isCheckedIn) return 'res-status-checked-in';
        if (isInProgress) return 'res-status-in-progress';
        if (isCompleted) return 'res-status-completed';
        if (isOngoing) return 'res-status-in-progress';
        if (isUpcoming) return 'res-status-upcoming';
        if (isPast) return 'res-status-past';
        return 'res-status-active';
    };

    const getStatusText = () => {
        if (isCancelled) return 'Cancelada';
        if (isCheckedIn) return 'Confirmada';
        if (isInProgress) return 'En Progreso';
        if (isCompleted) return 'Completada';
        if (isOngoing) return 'En Progreso';
        if (isUpcoming) return 'Próxima';
        if (isPast) return 'Pasada';
        return 'En curso';
    };

    let IconComponent = FaCalendarAlt;
    const name = (reservation.locationName || '').toLowerCase();
    if (name.includes('sala') || name.includes('reunion')) IconComponent = FaBuilding;
    if (name.includes('laptop') || name.includes('macbook')) IconComponent = FaLaptop;
    if (name.includes('kit') || name.includes('camara')) IconComponent = FaVideo;

    return (
        <div className={`reservation-card ${isCancelled ? 'cancelled' : ''}`}>
            <div className="card-left">
                <div className="card-icon-container">
                    <IconComponent className="card-icon" size={28} title="Icono de reserva" />
                </div>
                <div className="card-details">
                    <h3 className="card-title">{reservation.locationName}</h3>
                    <p className="card-subtitle">ID: {reservation.id}</p>
                </div>
            </div>

            <div className="card-middle">
                <div className="card-date-info">
                    <FaClock className="calendar-icon" size={20} />
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
                <span
                    className={`res-status-badge ${getStatusClass()}`}
                    data-status={(reservation.status || '').toLowerCase()}
                >
                    {getStatusText()}
                </span>

                <div className="card-actions">
                    {(isInProgress || isOngoing) && !isCancelled && !isCompleted && onDeliver && (
                        <button className="btn-deliver-res" onClick={() => onDeliver(reservation)} title="Registrar entrega">
                            <FaBox size={18} />
                        </button>
                    )}
                    
                    {(isInProgress || isOngoing) && !isCancelled && !isCompleted && onScanQR && (
                        <button className="btn-deliver-res" onClick={() => onScanQR(reservation)} title="Confirmar reserva con QR">
                            <FaQrcode size={18} />
                        </button>
                    )}
                    {isInProgress && onReturn && (
                        <button className="btn-return-res" onClick={() => onReturn(reservation)} title="Registrar devolucion">
                            <FaCheckCircle size={18} />
                        </button>
                    )}

                    {isUpcoming && !isCancelled && onEdit && (
                        <button className="btn-edit-res" onClick={() => onEdit(reservation)} title="Actualizar horario">
                            <FaEdit size={18} />
                        </button>
                    )}

                    {isUpcoming && !isCancelled && (
                        <button className="btn-cancel-res" onClick={() => onCancel(reservation.id)} title="Cancelar reserva">
                            <FaTrash size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
