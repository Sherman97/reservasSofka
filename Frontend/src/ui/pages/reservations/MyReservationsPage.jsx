import React, { useState } from 'react';
import { useUserReservations } from '../../../core/adapters/hooks/useUserReservations';
import { useReminderAlerts } from '../../../core/adapters/hooks/useReminderAlerts';
import { ReservationFilterBar } from '../../components/reservations/ReservationFilterBar';
import { ReservationList } from '../../components/reservations/ReservationList';
import { HandoverModal } from '../../components/reservations/HandoverModal';
import { ReminderAlertBanner } from '../../components/reservations/ReminderAlertBanner';
import { Pagination } from '../../components/common/Pagination';
import '../../styles/reservations/Reservations.css';
import '../../styles/reservations/ReminderAlerts.css';

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
        deliverReservation,
        returnReservation,
        reload
    } = useUserReservations();

    const { alerts, dismissAlert, clearAllAlerts } = useReminderAlerts();

    const [currentPage, setCurrentPage] = useState(1);
    const [handoverModal, setHandoverModal] = useState({ isOpen: false, reservation: null, action: null });
    const itemsPerPage = 5;

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
                            onDeliver={handleOpenDeliver}
                            onReturn={handleOpenReturn}
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
            </div>
        </div>
    );
};

export default MyReservationsPage;
