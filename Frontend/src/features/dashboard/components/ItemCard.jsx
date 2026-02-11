import React from 'react';
import { useReservation } from '../hooks/useReservation';
import { ReservationModal } from './modal/ReservationModal';

export const ItemCard = ({ item }) => {
    const reservation = useReservation(item);

    return (
        <>
            <div className="item-card">
                <div className="item-image-container">
                    <img src={item.image} alt={item.name} className="item-image" />
                    {item.available && <span className="status-badge">DISPONIBLE</span>}
                </div>
                <div className="item-content">
                    <div className="item-header">
                        <h3>{item.name}</h3>
                        {item.category && (
                            <span className="item-category">🎧 {item.category}</span>
                        )}
                    </div>
                    <div className="item-location">📍 {item.location}</div>
                    <div className="item-tags">
                        {item.tags.map((tag, index) => (
                            <span key={index} className="tag">{tag}</span>
                        ))}
                    </div>
                    <button className="btn-book" onClick={reservation.openModal}>
                        📅 Ver Calendario
                    </button>
                </div>
            </div>

            <ReservationModal
                isOpen={reservation.isOpen}
                item={item}
                currentDate={reservation.currentDate}
                selectedDate={reservation.selectedDate}
                selectedEquipment={reservation.selectedEquipment}
                startTime={reservation.startTime}
                endTime={reservation.endTime}
                availability={reservation.availability}
                onDateSelect={reservation.handleDateSelect}
                onEquipmentToggle={reservation.handleEquipmentToggle}
                onStartTimeChange={reservation.handleStartTimeChange}
                onEndTimeChange={reservation.handleEndTimeChange}
                onPreviousMonth={reservation.goToPreviousMonth}
                onNextMonth={reservation.goToNextMonth}
                onClose={reservation.closeModal}
                canConfirm={reservation.canConfirm}
            />
        </>
    );
};
