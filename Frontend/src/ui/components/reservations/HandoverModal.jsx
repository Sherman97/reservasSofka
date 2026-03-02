import React, { useState } from 'react';
import '../../styles/reservations/Reservations.css';

/**
 * HandoverModal - UI Component
 * Modal for entering novelty notes when delivering or returning a reservation
 */
export const HandoverModal = ({ isOpen, onClose, onConfirm, action, reservationName }) => {
    const [novelty, setNovelty] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const isDeliver = action === 'deliver';
    const title = isDeliver ? 'Registrar Entrega' : 'Registrar Devolución';
    const description = isDeliver
        ? `¿Confirmar la entrega del espacio "${reservationName}"? El estado cambiará a "En progreso".`
        : `¿Confirmar la devolución del espacio "${reservationName}"? El estado cambiará a "Completada".`;
    const confirmLabel = isDeliver ? 'Confirmar Entrega' : 'Confirmar Devolución';
    const icon = isDeliver ? '📦' : '✅';

    const handleConfirm = async () => {
        setSubmitting(true);
        try {
            await onConfirm(novelty.trim() || undefined);
            setNovelty('');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!submitting) {
            setNovelty('');
            onClose();
        }
    };

    return (
        <div className="handover-modal-overlay" onClick={handleClose}>
            <div className="handover-modal" onClick={e => e.stopPropagation()}>
                <div className="handover-modal-header">
                    <span className="handover-modal-icon">{icon}</span>
                    <h3>{title}</h3>
                    <button className="handover-modal-close" onClick={handleClose} disabled={submitting}>✕</button>
                </div>

                <div className="handover-modal-body">
                    <p className="handover-modal-description">{description}</p>

                    <label className="handover-modal-label" htmlFor="novelty-input">
                        Novedad (opcional)
                    </label>
                    <textarea
                        id="novelty-input"
                        className="handover-modal-textarea"
                        placeholder="Ej: Equipos en buen estado, se reporta daño en proyector..."
                        value={novelty}
                        onChange={e => setNovelty(e.target.value)}
                        rows={3}
                        disabled={submitting}
                    />
                </div>

                <div className="handover-modal-actions">
                    <button
                        className="btn-handover-cancel"
                        onClick={handleClose}
                        disabled={submitting}
                    >
                        Cancelar
                    </button>
                    <button
                        className={`btn-handover-confirm ${isDeliver ? 'btn-deliver' : 'btn-return'}`}
                        onClick={handleConfirm}
                        disabled={submitting}
                    >
                        {submitting ? 'Procesando...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};
