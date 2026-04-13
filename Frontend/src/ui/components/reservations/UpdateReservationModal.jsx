import React, { useState, useMemo } from 'react';
import { FaCalendarAlt } from 'react-icons/fa';
import '../../styles/reservations/Reservations.css';

/**
 * UpdateReservationModal - UI Component
 * Allows editing attendees, notes, and time only.
 * NOTE: The parent must pass a key={reservation?.id} so that React resets
 * the component's state whenever a different reservation is selected.
 */
const pad = (n) => n.toString().padStart(2, '0');

const parseReservation = (reservation) => {
    if (!reservation) return { attendeesCount: 1, notes: '', startTime: '', endTime: '', originalStartDate: '', originalEndDate: '', displayDate: '' };

    const start = reservation.startAt ? new Date(reservation.startAt) : null;
    const end = reservation.endAt ? new Date(reservation.endAt) : null;

    return {
        attendeesCount: reservation.attendeesCount || 1,
        notes: reservation.notes || '',
        startTime: start ? `${pad(start.getHours())}:${pad(start.getMinutes())}` : '',
        endTime: end ? `${pad(end.getHours())}:${pad(end.getMinutes())}` : '',
        originalStartDate: start
            ? `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`
            : '',
        originalEndDate: end
            ? `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`
            : '',
        displayDate: start
            ? start.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
            : '',
    };
};

export const UpdateReservationModal = ({ isOpen, onClose, onConfirm, reservation, errorMessage = null }) => {
    const initial = useMemo(() => parseReservation(reservation), [reservation]);

    const [attendeesCount, setAttendeesCount] = useState(initial.attendeesCount);
    const [notes, setNotes] = useState(initial.notes);
    const [startTime, setStartTime] = useState(initial.startTime);
    const [endTime, setEndTime] = useState(initial.endTime);
    const [localError, setLocalError] = useState(null);

    if (!isOpen || !reservation) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        if (startTime >= endTime) {
            setLocalError('La hora de inicio debe ser menor que la hora de fin.');
            return;
        }

        setLocalError(null);
        const buildISO = (dateStr, timeStr) => new Date(`${dateStr}T${timeStr}:00`).toISOString();
        onConfirm({
            attendeesCount: Number(attendeesCount),
            notes,
            startAt: buildISO(initial.originalStartDate, startTime),
            endAt: buildISO(initial.originalEndDate, endTime),
        });
    };

    return (
        <div className="handover-modal-overlay">
            <div className="handover-modal update-modal">
                <div className="handover-modal-header">
                    <div>
                        <h2 style={{ margin: 0 }}>Actualizar Reserva</h2>
                        <span style={{ fontSize: '0.9rem', color: '#718096', marginTop: '0.25rem', display: 'block' }}>
                            {reservation.locationName}
                        </span>
                    </div>
                </div>

                <form className="handover-modal-body" onSubmit={handleSubmit}>
                    {(localError || errorMessage) && (
                        <div style={{
                            marginBottom: '1rem',
                            padding: '0.75rem 1rem',
                            background: '#fff5f5',
                            color: '#c53030',
                            border: '1px solid #fed7d7',
                            borderRadius: '8px',
                            fontSize: '0.9rem'
                        }}>
                            {localError || errorMessage}
                        </div>
                    )}

                    {/* Read-only date info */}
                    <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: '#f0f4f8', borderRadius: '8px', fontSize: '0.9rem', color: '#4a5568' }}>
                        <span style={{ fontWeight: 600 }}>
                            <FaCalendarAlt size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                            Fecha: 
                        </span>
                        <span style={{ textTransform: 'capitalize' }}>{initial.displayDate}</span>
                        <div style={{ fontSize: '0.75rem', color: '#718096', marginTop: '0.25rem' }}>
                            La fecha no puede modificarse. Solo ajusta la hora de inicio y fin.
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label className="handover-modal-label">Hora inicio:</label>
                            <input
                                type="time"
                                className="handover-modal-textarea"
                                value={startTime}
                                onChange={(e) => {
                                    setStartTime(e.target.value);
                                    setLocalError(null);
                                }}
                                min="08:00"
                                max="18:00"
                                required
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="handover-modal-label">Hora fin:</label>
                            <input
                                type="time"
                                className="handover-modal-textarea"
                                value={endTime}
                                onChange={(e) => {
                                    setEndTime(e.target.value);
                                    setLocalError(null);
                                }}
                                min="08:00"
                                max="18:00"
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label className="handover-modal-label">Asistentes:</label>
                        <input
                            type="number"
                            min="1"
                            className="handover-modal-textarea"
                            value={attendeesCount}
                            onChange={(e) => setAttendeesCount(e.target.value)}
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label className="handover-modal-label">Notas adicionales:</label>
                        <textarea
                            className="handover-modal-textarea"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows="3"
                            placeholder="Cambios en catering, equipos, etc."
                        />
                    </div>

                    <div className="handover-modal-actions">
                        <button type="button" className="btn-handover-cancel" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-handover-confirm btn-return">
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
