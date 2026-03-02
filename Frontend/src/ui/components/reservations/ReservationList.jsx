import React from 'react';
import { ReservationCard } from './ReservationCard';

/**
 * ReservationList - UI Component
 * Renders a list of reservations
 */
export const ReservationList = ({ reservations = [], onCancel, onDeliver, onReturn }) => {
    if (!reservations || reservations.length === 0) {
        return (
            <div className="empty-state">
                <p>No se encontraron reservaciones en esta categoría.</p>
            </div>
        );
    }

    return (
        <div className="reservation-list">
            {reservations.map(res => (
                <ReservationCard
                    key={res.id}
                    reservation={res}
                    onCancel={onCancel}
                    onDeliver={onDeliver}
                    onReturn={onReturn}
                />
            ))}
        </div>
    );
};
