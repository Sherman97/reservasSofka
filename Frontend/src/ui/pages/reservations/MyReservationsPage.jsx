import React, { useState } from 'react';
import { useUserReservations } from '../../../core/adapters/hooks/useUserReservations';
import { ReservationFilterBar } from '../../components/reservations/ReservationFilterBar';
import { ReservationList } from '../../components/reservations/ReservationList';
import { Pagination } from '../../components/common/Pagination';
import '../../styles/reservations/Reservations.css';

/**
 * MyReservationsPage - UI Page
 * Displays and manages the user's reservations
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
        reload
    } = useUserReservations();

    const [currentPage, setCurrentPage] = useState(1);
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

    return (
        <div className="my-reservations-page">
            <div className="container">
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
            </div>
        </div>
    );
};

export default MyReservationsPage;
