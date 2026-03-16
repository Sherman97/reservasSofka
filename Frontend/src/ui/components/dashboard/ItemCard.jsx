import React from 'react';
import { useReservation } from '../../../core/adapters/hooks/useReservation';
import { ReservationModal } from './modal/ReservationModal';

export const ItemCard = ({ item }) => {
    // Only pass item to hook if it's a location (for now reservation logic is built around locations)
    // If it's an inventory item, we might need different logic or just disable reservation
    const isLocation = item._type === 'location' || item.type === 'location';
    const reservation = useReservation(isLocation ? item._entity || item : null);

    const handleConfirmBooking = () => {
        reservation.handleConfirm();
    };

    return (
        <>
            <div className="item-card">
                <div className="item-image-container">
                    <img src={item.image} alt={item.title} className="item-image" />
                    <span className={`status-badge ${item.available ? 'available' : 'unavailable'}`}>
                        {item.available ? 'DISPONIBLE' : 'NO DISPONIBLE'}
                    </span>
                </div>
                <div className="item-content">
                    <div className="item-header">
                        <h3>{item.title}</h3>
                        <span className="item-category">
                            {isLocation ? '🏢 Sala' : `🎧 ${item.category || 'Equipo'}`}
                        </span>
                    </div>
                    <div className="item-location">📍 {item.subtitle}</div>
                    <div className="item-tags">
                        {item.tags && item.tags.map((tag, index) => (
                            <span key={index} className="tag">{tag}</span>
                        ))}
                    </div>

                    <div className="item-actions">
                        {isLocation ? (
                            <button className="btn-book" onClick={reservation.openModal}>
                                📅 Reservar
                            </button>
                        ) : (
                            <button className="btn-book secondary" disabled>
                                ℹ️ Ver Detalles
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {isLocation && (
                <ReservationModal
                    isOpen={reservation.isOpen}
                    item={item}
                    currentDate={reservation.currentDate}
                    selectedDate={reservation.selectedDate}
                    selectedEquipment={reservation.selectedEquipment}
                    startTime={reservation.startTime}
                    endTime={reservation.endTime}
                    attendeesCount={reservation.attendeesCount}
                    availability={reservation.availability}
                    loading={reservation.loading}
                    busySlots={reservation.busySlots}
                    loadingSlots={reservation.loadingSlots}
                    hasTimeConflict={reservation.hasTimeConflict}
                    error={reservation.error}
                    successMessage={reservation.successMessage}
                    slotsUpdatedFlag={reservation.slotsUpdatedFlag}
                    onDateSelect={reservation.handleDateSelect}
                    onEquipmentToggle={reservation.handleEquipmentToggle}
                    onStartTimeChange={reservation.handleStartTimeChange}
                    onEndTimeChange={reservation.handleEndTimeChange}
                    onAttendeesCountChange={reservation.setAttendeesCount}
                    onPreviousMonth={reservation.goToPreviousMonth}
                    onNextMonth={reservation.goToNextMonth}
                    onClose={reservation.closeModal}
                    onConfirm={handleConfirmBooking}
                    canConfirm={reservation.canConfirm}
                />
            )}
        </>
    );
};
