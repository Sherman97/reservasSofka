import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useUserReservations } from '../../../core/adapters/hooks/useUserReservations';
import { useReminderAlerts } from '../../../core/adapters/hooks/useReminderAlerts';
import { ReservationFilterBar } from '../../components/reservations/ReservationFilterBar';
import { ReservationList } from '../../components/reservations/ReservationList';
import { HandoverModal } from '../../components/reservations/HandoverModal';
import { UpdateReservationModal } from '../../components/reservations/UpdateReservationModal';
import { ReminderAlertBanner } from '../../components/reservations/ReminderAlertBanner';
import { Pagination } from '../../components/common/Pagination';
import '../../styles/reservations/Reservations.css';
import '../../styles/reservations/ReminderAlerts.css';
import { ModalScanQr } from '../../components/reservations/ModalScanQr';

/**
 * MyReservationsPage - UI Page
 * Displays and manages the user's reservations with
 * deliver/return handover flow and real-time reminder alerts
 */
export const MyReservationsPage = () => {
    const {
        reservations,
        loading,
        error,
        searchTerm,
        activeTab,
        setActiveTab,
        handleSearch,
        cancelReservation,
        updateReservation,
        deliverReservation,
        returnReservation,
        reload
    } = useUserReservations();

    const { alerts, dismissAlert, clearAllAlerts } = useReminderAlerts();

    const [currentPage, setCurrentPage] = useState(1);
    const [handoverModal, setHandoverModal] = useState({ isOpen: false, reservation: null, action: null });
    const [updateModal, setUpdateModal] = useState({ isOpen: false, reservation: null });
    const [updateError, setUpdateError] = useState(null);
    const itemsPerPage = 5;
    const [scanQrReservation, setScanQrReservation] = useState(null);
    const getErrorMessage = (err) => {
        if (!err) return 'Error al actualizar reserva';
        if (typeof err === 'string') return err;

        const backendMessage = err.response?.data?.message;
        if (typeof backendMessage === 'string' && backendMessage.trim()) {
            return backendMessage;
        }

        if (Array.isArray(backendMessage) && backendMessage.length > 0) {
            return backendMessage.join(' | ');
        }

        if (backendMessage && typeof backendMessage === 'object') {
            const values = Object.values(backendMessage).filter(Boolean);
            if (values.length > 0) {
                return values.join(' | ');
            }
        }

        return err.message || 'Error al actualizar reserva';
    };

    // Periodic tick to re-evaluate reservation time status
    const [tick, setTick] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 15_000);
        return () => clearInterval(interval);
    }, []);

    // Track reservations that were ongoing so we detect when they expire
    const previouslyOngoingRef = useRef(new Set());
    const autoModalShownRef = useRef(new Set());

    const triggerReturnModal = useCallback((reservation) => {
        setHandoverModal({ isOpen: true, reservation, action: 'return' });
    }, []);

    // Auto-open return modal when an ongoing reservation expires (becomes past)
    useEffect(() => {
        if (!reservations || reservations.length === 0) return;

        const currentlyOngoing = new Set();
        reservations.forEach(r => {
            if (r.isOngoing() && !r.isCancelled() && !r.isCompleted()) {
                currentlyOngoing.add(r.id);
            }
        });

        // Check if any previously ongoing reservation is now past
        previouslyOngoingRef.current.forEach(id => {
            if (!currentlyOngoing.has(id) && !autoModalShownRef.current.has(id)) {
                const expiredRes = reservations.find(r => r.id === id && r.isPast() && !r.isCancelled() && !r.isCompleted());
                if (expiredRes) {
                    autoModalShownRef.current.add(id);
                    triggerReturnModal(expiredRes);
                }
            }
        });

        previouslyOngoingRef.current = currentlyOngoing;
    }, [reservations, triggerReturnModal, tick]);

    // Pagination logic
    const totalPages = Math.ceil(reservations.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentReservations = reservations.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleOpenDeliver = (reservation) => {
        setHandoverModal({ isOpen: true, reservation, action: 'deliver' });
    };

    const handleOpenReturn = (reservation) => {
        setHandoverModal({ isOpen: true, reservation, action: 'return' });
    };

    const handleCloseHandover = () => {
        setHandoverModal({ isOpen: false, reservation: null, action: null });
    };

    const handleConfirmHandover = async (novelty) => {
        const { reservation, action } = handoverModal;
        if (!reservation) return;

        if (action === 'deliver') {
            await deliverReservation(reservation.id, novelty);
        } else {
            await returnReservation(reservation.id, novelty);
        }
        handleCloseHandover();
    };

    const handleOpenUpdate = (reservation) => {
        setUpdateError(null);
        setUpdateModal({ isOpen: true, reservation });
    };

    const handleCloseUpdate = () => {
        setUpdateError(null);
        setUpdateModal({ isOpen: false, reservation: null });
    };

    const handleConfirmUpdate = async (data) => {
        const { reservation } = updateModal;
        if (!reservation) return;

        try {
            await updateReservation(reservation.id, data);
            handleCloseUpdate();
            reload(); // Refresh the list so next modal open shows updated values
        } catch (err) {
            setUpdateError(getErrorMessage(err));
        }
    };
    const handleScanQr = (reservation) => {
        setScanQrReservation(reservation);
    };

    const handleQrSuccess = () => {
        setScanQrReservation(null);
        reload();
    };
    return (
        <div className="my-reservations-page">
            <div className="container">
                <ReminderAlertBanner
                    alerts={alerts}
                    onDismiss={dismissAlert}
                    onClearAll={clearAllAlerts}
                />

                <ReservationFilterBar
                    activeTab={activeTab}
                    onTabChange={(tab) => {
                        setActiveTab(tab);
                        setCurrentPage(1);
                    }}
                    searchTerm={searchTerm}
                    onSearchChange={handleSearch}
                />

                {error && (
                    <div className="error-banner">
                        <p>⚠️ {error}</p>
                        <button onClick={reload} className="btn-retry">Reintentar</button>
                    </div>
                )}

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Cargando tus reservas...</p>
                    </div>
                ) : (
                    <>
                        <ReservationList
                            reservations={currentReservations}
                            onCancel={cancelReservation}
                            onUpdate={handleOpenUpdate}
                            onDeliver={handleOpenDeliver}
                            onReturn={handleOpenReturn}
                            onScanQR={handleScanQr}
                        />

                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </>
                )}

                <HandoverModal
                    isOpen={handoverModal.isOpen}
                    onClose={handleCloseHandover}
                    onConfirm={handleConfirmHandover}
                    action={handoverModal.action}
                    reservationName={handoverModal.reservation?.locationName || ''}
                />

                <UpdateReservationModal
                    key={updateModal.reservation?.id ?? 'update-modal'}
                    isOpen={updateModal.isOpen}
                    onClose={handleCloseUpdate}
                    onConfirm={handleConfirmUpdate}
                    reservation={updateModal.reservation}
                    errorMessage={updateError}
                />

                <ModalScanQr
                    isOpen={scanQrReservation !== null}
                    onClose={() => setScanQrReservation(null)}
                    reservation={scanQrReservation}
                    onSuccess={handleQrSuccess}
                />
            </div>
        </div>
    );
};

export default MyReservationsPage;
