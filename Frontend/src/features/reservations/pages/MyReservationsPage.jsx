import React, { useState, useEffect } from 'react';
import { ReservationFilterBar } from '../components/ReservationFilterBar';
import { ReservationList } from '../components/ReservationList';
import { getUserReservations } from '../services/userReservationsService';
import { Pagination } from '../../../components/common/Pagination';
import '../styles/MyReservations.css';

export const MyReservationsPage = () => {
    const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, past, cancelled
    const [searchTerm, setSearchTerm] = useState('');
    const [reservations, setReservations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        const fetchReservations = async () => {
            setIsLoading(true);
            try {
                const data = await getUserReservations(activeTab, searchTerm);
                setReservations(data);
                setCurrentPage(1); // Reset to first page on filter change
            } catch (error) {
                console.error("Error fetching reservations:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReservations();
    }, [activeTab, searchTerm]);

    // Pagination logic
    const totalPages = Math.ceil(reservations.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentReservations = reservations.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id) => {
        if (window.confirm('¿Estás seguro de cancelar esta reserva?')) {
            alert(`Reserva ${id} cancelada`);
            // Here we would call API to delete and then refresh
        }
    };

    return (
        <div className="my-reservations-page">
            <ReservationFilterBar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            />

            {isLoading ? (
                <p>Cargando...</p>
            ) : (
                <>
                    <ReservationList
                        reservations={currentReservations}
                        onDelete={handleDelete}
                    />

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </>
            )}
        </div>
    );
};
