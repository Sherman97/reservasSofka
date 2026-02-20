import { useState, useEffect, useMemo } from 'react';
import { useAuthDependencies, useReservationDependencies } from './useDependencies';

/**
 * useUserReservations - Adapter Hook
 * Connects UI to Reservation use cases
 * Manages user's reservations, filtering, and cancellation
 */
export const useUserReservations = () => {
    const { getUserReservationsUseCase, cancelReservationUseCase } = useReservationDependencies();
    const { getCurrentUserUseCase } = useAuthDependencies();

    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'past', 'cancelled'

    const loadReservations = useCallback(async () => {
        const user = getCurrentUserUseCase.execute();
        if (!user) {
            setError('Usuario no autenticado');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = await getUserReservationsUseCase.execute(user.id);
            setReservations(data);
        } catch (err) {
            console.error('Error loading reservations:', err);
            setError(err.message || 'Error al cargar las reservas');
        } finally {
            setLoading(false);
        }
    }, [getCurrentUserUseCase, getUserReservationsUseCase]);

    useEffect(() => {
        loadReservations();
    }, [loadReservations]);

    const handleCancelReservation = async (reservationId) => {
        if (!window.confirm('¿Estás seguro de cancelar esta reserva?')) {
            return;
        }

        setLoading(true);
        try {
            await cancelReservationUseCase.execute(reservationId);
            // Refresh list
            await loadReservations();
        } catch (err) {
            console.error('Error cancelling reservation:', err);
            alert(err.message || 'Error al cancelar la reserva');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (query) => {
        setSearchTerm(query);
    };

    const filteredReservations = useMemo(() => {
        return reservations.filter(res => {
            // Search filter
            const matchesSearch =
                (res.locationName && res.locationName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (res.id && res.id.toString().includes(searchTerm));

            // Tab filter
            let matchesTab = true;
            if (activeTab === 'upcoming') {
                matchesTab = res.isUpcoming();
            } else if (activeTab === 'past') {
                matchesTab = res.isPast() && res.isActive();
            } else if (activeTab === 'cancelled') {
                matchesTab = res.isCancelled();
            }

            return matchesSearch && matchesTab;
        });
    }, [reservations, searchTerm, activeTab]);

    return {
        reservations: filteredReservations,
        allReservations: reservations,
        loading,
        error,
        searchTerm,
        activeTab,
        setActiveTab,
        handleSearch,
        cancelReservation: handleCancelReservation,
        reload: loadReservations
    };
};
