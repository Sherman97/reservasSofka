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
    const qrReaderRef = useRef(null);
    // Ref used by the automation hook so the event listener always calls the latest closure
    const onScanSuccessRef = useRef(null);
    const isProcessingRef = useRef(false);

    const onScanSuccess = useCallback(async (decodedText) => {
        if (isProcessingRef.current || !reservation) return;

        isProcessingRef.current = true;
        setProcessing(true);
        setScanError(null);

        try {
            // Stop scanner to prevent multiple scans
            if (scannerRef.current) {
                await scannerRef.current.clear();
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
    }, [checkIn, reservation, onSuccess]);

    // Keep the ref in sync so the automation hook always calls the latest closure
    onScanSuccessRef.current = onScanSuccess;

    // E2E automation hook: listen for 'qr-scanned' window event dispatched by Selenium.
    // The ref is updated on every render so the listener always uses the current closure.
    useEffect(() => {
        if (!isOpen || !reservation) return;

        const handleAutomationScan = (event) => {
            const token = event.detail?.token || event.detail?.spaceName || 'automation-test-token';
            console.debug('[Automation] qr-scanned event received, token:', token);
            if (onScanSuccessRef.current) onScanSuccessRef.current(token);
        };

        window.addEventListener('qr-scanned', handleAutomationScan);
        return () => window.removeEventListener('qr-scanned', handleAutomationScan);
    }, [isOpen, reservation]);

    useEffect(() => {
        if (!isOpen || !reservation) {
            // Cleanup scanner if modal closes
            if (scannerRef.current) {
                scannerRef.current.clear().catch(err => {
                    console.warn('Error clearing QR scanner:', err);
                });
                scannerRef.current = null;
            }
            setScanning(false);
            setScanError(null);
            setProcessing(false);
            return;
        }

        // Initialize scanner when modal opens
        const initScanner = async () => {
            try {
                setScanError(null);

                // Verify element exists
                const element = document.getElementById("qr-reader");
                if (!element) {
                    // Small delay only if not found, to account for React modal transition
                    await new Promise(resolve => setTimeout(resolve, 50));
                    if (!document.getElementById("qr-reader")) {
                        throw new Error('Scanner container not found in DOM');
                    }
                }

                const scanner = new Html5QrcodeScanner(
                    "qr-reader",
                    { 
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0,
                        showTorchButtonIfSupported: true,
                        showZoomSliderIfSupported: true
                    },
                    false
                );

                scannerRef.current = scanner;

                scanner.render(
                    (decodedText) => onScanSuccess(decodedText),
                    (errorMessage) => {
                        // Ignore frequent scanning errors, only log real issues
                        if (!errorMessage.includes('NotFoundException')) {
                            console.debug('QR scan error:', errorMessage);
                        }
                    }
                );
                
                // Confirm initialization success
                // Use a microtask to allow the UI to render the "Initializing" state in tests
                Promise.resolve().then(() => {
                    if (isOpen && reservation) {
                        setScanning(true);
                    }
                });
            } catch (err) {
                console.error('Error initializing QR scanner:', err);
                setScanError('Error al inicializar el escáner. Por favor, verifica los permisos de la cámara.');
                setScanning(false);
            }
        };

        initScanner();

        // Cleanup on unmount or when dependencies change
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(err => {
                    console.warn('Error clearing QR scanner on cleanup:', err);
                });
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
                                <div id="qr-reader" ref={qrReaderRef}></div>
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
