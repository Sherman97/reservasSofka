import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { FaCamera } from 'react-icons/fa';
import { FiSmartphone } from 'react-icons/fi';
import { BiError } from 'react-icons/bi';
import { MdClose } from 'react-icons/md';
import { useCheckIn } from '../../../core/adapters/hooks/useCheckIn';
import '../../styles/reservations/Reservations.css';

/**
 * ModalScanQr - UI Component
 * Modal for scanning QR codes to perform check-in on a reservation.
 * Uses device camera to scan QR codes from physical spaces.
 */
export const ModalScanQr = ({ isOpen, onClose, reservation, onSuccess }) => {
    const { checkIn, loading, error: checkInError } = useCheckIn();
    const [scanning, setScanning] = useState(false);
    const [scanError, setScanError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const scannerRef = useRef(null);
    const isProcessingRef = useRef(false);

    const onScanSuccess = useCallback(async (decodedText) => {
        if (isProcessingRef.current || !reservation) return;

        isProcessingRef.current = true;
        setProcessing(true);
        setScanError(null);

        try {
            // Stop scanner to prevent multiple scans
            if (scannerRef.current) {
                await scannerRef.current.clear().catch(() => {});
                scannerRef.current = null;
            }
            setScanning(false);

            // Perform check-in with scanned QR token
            await checkIn(reservation.id, decodedText);
            
            // Success - notify parent
            onSuccess();
        } catch (err) {
            console.error('Error during check-in:', err);
            setScanError(err.message || 'Error al realizar el check-in');
            setProcessing(false);
            isProcessingRef.current = false;
        }
    }, [checkIn, reservation?.id, onSuccess]);

    // Cleanup and Init Scanner
    useEffect(() => {
        if (!isOpen || !reservation) {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(() => {});
                scannerRef.current = null;
            }
            setScanning(false);
            return;
        }

        const initScanner = () => {
            try {
                setScanError(null);
                const element = document.getElementById("qr-reader");
                if (!element) {
                    // Fail gracefully if element not found (maybe modal closed fast)
                    return;
                }

                const scanner = new Html5QrcodeScanner(
                    "qr-reader",
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    /* verbose= */ false
                );

                scannerRef.current = scanner;
                scanner.render(
                    (decodedText) => onScanSuccess(decodedText),
                    (errorMessage) => {
                        if (!errorMessage.includes('NotFoundException')) {
                            console.debug('QR scan error:', errorMessage);
                        }
                    }
                );
                
                setScanning(true);
            } catch (err) {
                console.error('Error initializing QR scanner:', err);
                setScanError('Error al inicializar el escáner. Por favor, verifica los permisos de la cámara.');
            }
        };

        initScanner();

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(() => {});
                scannerRef.current = null;
            }
        };
    }, [isOpen, reservation, onScanSuccess]);

    const handleClose = () => {
        if (!processing && !loading) {
            onClose();
        }
    };

    if (!isOpen || !reservation) return null;

    return (
        <div className="handover-modal-overlay" onClick={handleClose}>
                <div className="handover-modal qr-scan-modal" onClick={e => e.stopPropagation()}>
                    <div className="handover-modal-header">
                        <FaCamera className="handover-modal-icon" size={24} />
                        <h3>Escanear Código QR</h3>
                        <button 
                            className="handover-modal-close" 
                            onClick={handleClose} 
                            disabled={processing || loading}
                            aria-label="Cerrar"
                        >
                            <MdClose size={20} />
                        </button>
                    </div>

                    <div className="handover-modal-body">
                        <p className="handover-modal-description">
                            Escanea el código QR del espacio <strong>{reservation.locationName}</strong> para realizar el check-in.
                        </p>

                        {!processing && !scanError && !checkInError && (
                            <div className="qr-scanner-container">
                                <div id="qr-reader"></div>
                                {scanning && (
                                    <p className="qr-scanner-help">
                                        <FiSmartphone size={18} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                                        Apunta la cámara hacia el código QR del espacio
                                    </p>
                                )}
                            </div>
                        )}

                        {processing && (
                            <div className="qr-processing">
                                <div className="spinner"></div>
                                <p>Procesando check-in...</p>
                            </div>
                        )}

                        {(scanError || checkInError) && (
                            <div className="qr-error-banner">
                                <p><BiError size={20} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> {scanError || checkInError}</p>
                            </div>
                        )}

                        {!scanning && !processing && !scanError && !checkInError && (
                            <div className="qr-initializing">
                                <div className="spinner"></div>
                                <p>Iniciando cámara...</p>
                            </div>
                        )}
                    </div>

                    <div className="handover-modal-actions">
                        <button
                            className="btn-handover-cancel"
                            onClick={handleClose}
                            disabled={processing || loading}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
    );
};
