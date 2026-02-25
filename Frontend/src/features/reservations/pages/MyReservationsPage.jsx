import React, { useState, useEffect } from 'react';
import { ReservationFilterBar } from '../components/ReservationFilterBar';
import { ReservationList } from '../components/ReservationList';
import { getUserReservations } from '../services/userReservationsService';
import '../styles/MyReservations.css';

export const MyReservationsPage = () => {
    const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, past, cancelled
    const [searchTerm, setSearchTerm] = useState('');
    const [reservations, setReservations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchReservations = async () => {
            setIsLoading(true);
            try {
                // In a real app, we might debounce search or pass filters to API
                const data = await getUserReservations(activeTab, searchTerm);
                setReservations(data);
            } catch (error) {
                console.error("Error fetching reservations:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReservations();
    }, [activeTab, searchTerm]);


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
                        reservations={reservations}
                        onDelete={handleDelete}
                    />

                    <div className="pagination-container">
                        <span>Mostrando {reservations.length} reservas activas</span>
                        <div className="pagination-controls">
                            <button className="page-btn">{'<'}</button>
                            <button className="page-btn active">1</button>
                            <button className="page-btn">2</button>
                            <button className="page-btn">{'>'}</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
