import React, { useState, useEffect } from 'react';
import '../../styles/reservations/Reservations.css';

/**
 * UpdateReservationModal - UI Component
 * Allows editing the reservation's title, attendees, notes, and TIME only.
 * The original date is preserved — only the start/end time can be changed.
 */
export const UpdateReservationModal = ({ isOpen, onClose, onConfirm, reservation }) => {
    const [attendeesCount, setAttendeesCount] = useState(1);
    const [notes, setNotes] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [originalStartDate, setOriginalStartDate] = useState('');
    const [originalEndDate, setOriginalEndDate] = useState('');
    const [displayDate, setDisplayDate] = useState('');

    useEffect(() => {
        if (isOpen && reservation) {
            setAttendeesCount(reservation.attendeesCount || 1);
            setNotes(reservation.notes || '');

            const pad = (n) => n.toString().padStart(2, '0');

            if (reservation.startAt) {
                const d = new Date(reservation.startAt);
                const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
                setOriginalStartDate(dateStr);
                setStartTime(`${pad(d.getHours())}:${pad(d.getMinutes())}`);
                setDisplayDate(d.toLocaleDateString('es-CO', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                }));
            }

            if (reservation.endAt) {
                const d = new Date(reservation.endAt);
                const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
                setOriginalEndDate(dateStr);
                setEndTime(`${pad(d.getHours())}:${pad(d.getMinutes())}`);
            }
        }
    }, [isOpen, reservation]);

    if (!isOpen || !reservation) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        const buildISO = (dateStr, timeStr) => new Date(`${dateStr}T${timeStr}:00`).toISOString();

        onConfirm({
            attendeesCount: Number(attendeesCount),
            notes,
            startAt: buildISO(originalStartDate, startTime),
            endAt: buildISO(originalEndDate, endTime),
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
                    {/* Read-only date info */}
                    <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: '#f0f4f8', borderRadius: '8px', fontSize: '0.9rem', color: '#4a5568' }}>
                        <span style={{ fontWeight: 600 }}>📅 Fecha: </span>
                        <span style={{ textTransform: 'capitalize' }}>{displayDate}</span>
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
                                onChange={(e) => setStartTime(e.target.value)}
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
                                onChange={(e) => setEndTime(e.target.value)}
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
