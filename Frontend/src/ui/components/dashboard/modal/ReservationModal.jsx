import React from 'react';
import { FaMapMarkerAlt, FaBuilding, FaCheckCircle } from 'react-icons/fa';
import { BiError } from 'react-icons/bi';
import { MdClose } from 'react-icons/md';
import { Calendar } from './Calendar';
import { EquipmentSelector } from './EquipmentSelector';
import { DurationSelector } from './DurationSelector';
import '../../../styles/dashboard/ReservationModal.css';

export const ReservationModal = ({
    isOpen,
    item,
    currentDate,
    selectedDate,
    selectedEquipment = [],
    startTime,
    endTime,
    attendeesCount = 1,
    availability,
    onDateSelect,
    onEquipmentToggle,
    onStartTimeChange,
    onEndTimeChange,
    onAttendeesCountChange,
    onPreviousMonth,
    onNextMonth,
    onClose,
    onConfirm,
    canConfirm,
    loading,
    error = null,
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
                <button className="modal-close" onClick={onClose} aria-label="Cerrar">
                    <MdClose size={20} />
                </button>

                <div className="modal-header">
                    <div className="modal-item-info">
                        <img src={item.image} alt={item.title} className="modal-item-image" />
                        <div className="modal-item-details">
                            <h2>{item.title}</h2>
                            <p className="modal-item-location">
                                <FaMapMarkerAlt size={14} style={{ marginRight: '4px' }} />
                                {item.location || 'Sede Central'}
                            </p>
                            {/* Check item type safely */}
                            {(item.type === 'location' || item._type === 'location') && (
                                <p className="modal-item-type">
                                    <FaBuilding size={14} style={{ marginRight: '4px' }} />
                                    Locación
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="modal-body">

                    {successMessage && (
                        <div className="modal-success-banner">
                            <FaCheckCircle className="success-icon" size={20} />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {!successMessage && error && (
                        <div className="modal-error-banner">
                            <BiError className="error-icon" size={20} />
                            <span>{error}</span>
                        </div>
                    )}

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
                                    item={item}
                                    successMessage={successMessage}
                                />
                                
                                <div style={{marginTop: '15px'}} className="modal-section-attendees">
                                    <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem', color: '#555'}}>Asistentes:</label>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        value={attendeesCount} 
                                        onChange={(e) => onAttendeesCountChange?.(Number(e.target.value))}
                                        style={{width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem', transition: 'border-color 0.2s', backgroundColor: '#f9f9f9'}}
                                    />
                                </div>
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
