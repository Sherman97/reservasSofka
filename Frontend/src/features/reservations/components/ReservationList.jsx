import React from 'react';
import { ReservationCard } from './ReservationCard';

export const ReservationList = ({ reservations = [], onEdit, onDelete }) => {
    if (!reservations || reservations.length === 0) {
        return (
            <div className="empty-state">
                <p>No se encontraron reservaciones.</p>
            </div>
        );
    }

    return (
        <div className="reservation-list">
            {reservations.map(res => (
                <ReservationCard
                    key={res.id}
                    reservation={res}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};
