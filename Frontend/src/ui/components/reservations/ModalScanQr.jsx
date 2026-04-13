import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
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
    
    const html5QrCodeRef = useRef(null);
    const isProcessingRef = useRef(false);
    
    // Use ref to maintain stable reference to latest callback
    const onSuccessRef = useRef(onSuccess);
    const reservationRef = useRef(reservation);
    const checkInRef = useRef(checkIn);
    
    // Update refs when props change
    useEffect(() => {
        onSuccessRef.current = onSuccess;
        reservationRef.current = reservation;
        checkInRef.current = checkIn;
    }, [onSuccess, reservation, checkIn]);
    
    // Safe scanner cleanup helper
    const cleanupScanner = useCallback(async () => {
        if (html5QrCodeRef.current) {
            try {
                if (html5QrCodeRef.current.isScanning) {
                    await html5QrCodeRef.current.stop();
                }
                html5QrCodeRef.current.clear();
            } catch (err) {
                console.debug('Error cleaning up scanner:', err);
            }
            html5QrCodeRef.current = null;
        }
    }, []);

    const onScanSuccess = useCallback(async (decodedText) => {
        if (isProcessingRef.current || !reservationRef.current) return;

        isProcessingRef.current = true;
        setProcessing(true);
        setScanError(null);

        try {
            // Stop scanner to prevent multiple scans
            await cleanupScanner();
            setScanning(false);

            // Perform check-in with scanned QR token
            await checkInRef.current(reservationRef.current.id, decodedText);
            
            // Success - notify parent
            onSuccessRef.current();
        } catch (err) {
            console.error('Error during check-in:', err);
            setScanError(err.message || 'Error al realizar el check-in');
            setProcessing(false);
            isProcessingRef.current = false;
        }
    }, [cleanupScanner]);

    // Cleanup and Init Scanner
    useEffect(() => {
        if (!isOpen || !reservation) {
            cleanupScanner();
            setScanning(false);
            return;
        }

        let mounted = true;

        const initScanner = async () => {
            try {
                setScanError(null);
                
                // Wait a bit for the modal animation to finish
                await new Promise(resolve => setTimeout(resolve, 500));
                if (!mounted) return;

                const elementId = "qr-reader";
                const element = document.getElementById(elementId);
                
                if (!element) {
                    console.warn('QR reader element not found');
                    if (mounted) {
                        setScanError('Cargando interfaz de escaneo...');
                    }
                    return;
                }

                // If somehow an instance already exists, stop it
                if (html5QrCodeRef.current) {
                    await cleanupScanner();
                }

                const html5QrCode = new Html5Qrcode(elementId);
                html5QrCodeRef.current = html5QrCode;

                const config = {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                };

                await html5QrCode.start(
                    { facingMode: "environment" },
                    config,
                    (decodedText) => onScanSuccess(decodedText),
                    (errorMessage) => {
                        // Ignore routine "no QR found in frame" errors
                        if (!errorMessage.includes("NotFoundException")) {
                            // Only console for debugging
                        }
                    }
                );

                if (mounted) {
                    setScanning(true);
                }
            } catch (err) {
                console.error('Error initializing QR scanner:', err);
                if (mounted) {
                    let userFriendlyError = 'Error al inicializar la cámara.';
                    
                    if (err.name === 'NotAllowedError' || err.message?.includes('Permission')) {
                        userFriendlyError = 'Debes permitir el acceso a la cámara para escanear códigos QR.';
                    } else if (err.name === 'NotFoundError') {
                        userFriendlyError = 'No se encontró ninguna cámara en este dispositivo.';
                    } else if (err.name === 'NotReadableError' || err.message?.includes('in use')) {
                        userFriendlyError = 'La cámara ya está siendo usada por otra aplicación.';
                    }
                    
                    setScanError(userFriendlyError);
                }
            }
        };

        initScanner();

        return () => {
            mounted = false;
            cleanupScanner();
        };
    }, [isOpen, reservation?.id, onScanSuccess, cleanupScanner]);
 // Only re-init if modal opens/closes or reservation changes

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
                                <p>
                                    <BiError size={20} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> 
                                    {scanError || checkInError}
                                </p>
                                {scanError && scanError.includes('permitir') && (
                                    <p style={{ fontSize: '13px', marginTop: '8px' }}>
                                        💡 <strong>Ayuda:</strong> Busca el ícono de cámara en la barra de dirección de tu navegador y permite el acceso.
                                    </p>
                                )}
                                {scanError && (
                                    <button 
                                        className="btn-handover-retry"
                                        onClick={() => {
                                            setScanError(null);
                                            window.location.reload();
                                        }}
                                        style={{ marginTop: '12px' }}
                                    >
                                        Reintentar
                                    </button>
                                )}
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
