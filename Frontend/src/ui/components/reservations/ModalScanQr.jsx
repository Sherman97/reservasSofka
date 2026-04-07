import '../../styles/reservations/Reservations.css';
import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useCheckIn } from '../../../core/adapters/hooks/useCheckIn';

/**
 * ModalScanQr - UI Component
 * Modal for scanning QR codes when delivering or returning a reservation
 */
export const ModalScanQr = ({ isOpen, onClose, reservation, onSuccess }) => {
    const { checkIn, loading, error } = useCheckIn();
    const [scanError, setScanError] = useState(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (isOpen && reservation) {
            // Inicializar scanner de QR
            const scanner = new Html5QrcodeScanner(...);
            scanner.render(onScanSuccess, onScanError);
            return () => scanner.clear();
        }
    }, [isOpen, reservation]);

    const onScanSuccess = async (decodedText) => {
        setProcessing(true);
        try {
            await checkIn(reservation.id, decodedText); // ✅ Usar el hook
            onSuccess(); // Notificar éxito
        } catch (err) {
            setScanError(err.message);
        } finally {
            setProcessing(false);
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
