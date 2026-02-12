import React from 'react';
import { Calendar } from './Calendar';
import { EquipmentSelector } from './EquipmentSelector';
import { DurationSelector } from './DurationSelector';
import { createReservation } from '../../services/reservationService';
import '../../styles/ReservationModal.css';

export const ReservationModal = ({
    isOpen,
    item,
    currentDate,
    selectedDate,
    selectedEquipment,
    startTime,
    endTime,
    availability,
    onDateSelect,
    onEquipmentToggle,
    onStartTimeChange,
    onEndTimeChange,
    onPreviousMonth,
    onNextMonth,
    onClose,
    canConfirm
}) => {
    if (!isOpen) return null;

    const handleConfirm = async () => {
        // Format the date properly
        const bookingDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            selectedDate
        );

        const year = bookingDate.getFullYear();
        const month = String(bookingDate.getMonth() + 1).padStart(2, '0');
        const day = String(bookingDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        // Format booking data for backend
        const reservationData = {
            locationId: item.isLocation ? item.backendId : null,
            itemId: !item.isLocation ? item.backendId : null,
            date: dateStr,
            startTime,
            endTime,
            items: selectedEquipment // Array of { itemId, name, qty }
        };

        try {
            const result = await createReservation(reservationData);
            if (result.ok) {
                alert(`¡Reserva confirmada exitosamente!`);
                onClose();
            } else {
                alert(result.message || 'Error al crear la reserva');
            }
        } catch (error) {
            console.error('Error creating reservation:', error);
            alert('Error al crear la reserva. Por favor intenta de nuevo.');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>

                <div className="modal-header">
                    <div className="modal-item-info">
                        <img src={item.image} alt={item.name} className="modal-item-image" />
                        <div className="modal-item-details">
                            <h2>{item.name}</h2>
                            <p className="modal-item-location">📍 {item.location}</p>
                            {item.isLocation && (
                                <p className="modal-item-type">🏢 Locación</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="modal-body">
                    <div className="modal-columns">
                        <div className="modal-left-column">
                            <div className="modal-section">
                                <h3>Selecciona una Fecha</h3>
                                <Calendar
                                    currentDate={currentDate}
                                    selectedDate={selectedDate}
                                    availability={availability}
                                    onDateSelect={onDateSelect}
                                    onPreviousMonth={onPreviousMonth}
                                    onNextMonth={onNextMonth}
                                />
                            </div>
                        </div>

                        <div className="modal-right-column">
                            <div className="modal-section">
                                <h3>Horario de Reserva</h3>
                                <DurationSelector
                                    startTime={startTime}
                                    endTime={endTime}
                                    onStartTimeChange={onStartTimeChange}
                                    onEndTimeChange={onEndTimeChange}
                                />
                            </div>

                            <div className="modal-section">
                                <h3>Equipos Adicionales</h3>
                                <EquipmentSelector
                                    selectedEquipment={selectedEquipment}
                                    onEquipmentToggle={onEquipmentToggle}
                                    item={item}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose}>
                        Cancelar
                    </button>
                    <button
                        className="btn-confirm"
                        onClick={handleConfirm}
                        disabled={!canConfirm}
                    >
                        Confirmar Reserva
                    </button>
                </div>
            </div>
        </div>
    );
};
