import React from 'react';
import '../styles/MyReservations.css';

export const ReservationCard = ({ reservation, onDelete }) => {


    const getStatusClass = (status) => {
        switch (status) {
            case 'active': return 'res-status-active';
            case 'confirmed': return 'res-status-confirmed';
            case 'pending': return 'res-status-pending';
            default: return '';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'active': return 'En curso';
            case 'confirmed': return 'Confirmada';
            case 'pending': return 'Pendiente';
            default: return status;
        }
    };

    // Determine icon based on some logic or prop. 
    // Using title keywords for now as mock data doesn't have strict types
    let icon = '📅';
    if (reservation.title.includes('Sala')) icon = '🏢'; // Door/Room
    if (reservation.title.includes('MacBook') || reservation.title.includes('Laptop')) icon = '💻';
    if (reservation.title.includes('Kit') || reservation.title.includes('Camara')) icon = '📹';

    return (
        <div className="reservation-card">
            <div className="card-left">
                <div className="card-icon-container">
                    <span className="card-icon">{icon}</span>
                </div>
                <div className="card-details">
                    <h3 className="card-title">{reservation.title}</h3>
                    <p className="card-subtitle">{reservation.location}</p>
                </div>
            </div>

            <div className="card-middle">
                <div className="card-date-info">
                    <span className="calendar-icon">📅</span>
                    <div className="date-text">
                        <span className="date-main">{reservation.date}</span>
                        <span className="date-sub">{reservation.time}</span>
                    </div>
                </div>
            </div>

            <div className="card-right">
                <span className={`res-status-badge ${getStatusClass(reservation.status)}`}>
                    {getStatusText(reservation.status)}
                </span>

                <div className="card-actions">
                    <button className="btn-delete" onClick={() => onDelete(reservation.id)}>
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    );
};
