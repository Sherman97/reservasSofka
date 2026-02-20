import React from 'react';
import { Calendar } from './Calendar';
import { DurationSelector } from './DurationSelector';
import '../../../styles/dashboard/ReservationModal.css';

export const ReservationModal = ({
    isOpen,
    item,
    currentDate,
    selectedDate,
    startTime,
    endTime,
    availability,
    onDateSelect,
    onStartTimeChange,
    onEndTimeChange,
    onPreviousMonth,
    onNextMonth,
    onClose,
    onConfirm,
    canConfirm,
    loading,
    busySlots = [],
    loadingSlots = false,
    hasTimeConflict = false,
    successMessage = null,
    slotsUpdatedFlag = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>x</button>

                <div className="modal-header">
                    <div className="modal-item-info">
                        <img src={item.image} alt={item.title} className="modal-item-image" />
                        <div className="modal-item-details">
                            <h2>{item.title}</h2>
                            <p className="modal-item-location">Ubicacion: {item.location || 'Sede Central'}</p>
                            {(item.type === 'location' || item._type === 'location') && (
                                <p className="modal-item-type">Tipo: Locacion</p>
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
                                    busySlots={busySlots}
                                    loadingSlots={loadingSlots}
                                    hasTimeConflict={hasTimeConflict}
                                    selectedDate={selectedDate}
                                    slotsUpdatedFlag={slotsUpdatedFlag}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose}>
                        {successMessage ? 'Cerrar' : 'Cancelar'}
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
