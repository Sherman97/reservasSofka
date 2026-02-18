import React from 'react';
import { Calendar } from './Calendar';
import { EquipmentSelector } from './EquipmentSelector';
import { DurationSelector } from './DurationSelector';
import '../../../styles/dashboard/ReservationModal.css';

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
    onConfirm, // New prop for confirm action
    canConfirm,
    loading // New prop for loading state
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>

                <div className="modal-header">
                    <div className="modal-item-info">
                        <img src={item.image} alt={item.title} className="modal-item-image" />
                        <div className="modal-item-details">
                            <h2>{item.title}</h2>
                            <p className="modal-item-location">📍 {item.location || 'Sede Central'}</p>
                            {/* Check item type safely */}
                            {(item.type === 'location' || item._type === 'location') && (
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
                        onClick={onConfirm}
                        disabled={!canConfirm || loading}
                    >
                        {loading ? 'Confirmando...' : 'Confirmar Reserva'}
                    </button>
                </div>
            </div>
        </div>
    );
};
