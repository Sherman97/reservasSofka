import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuthDependencies, useReservationDependencies } from '../providers/DependencyProvider';
import type { Reservation } from '../../../core/domain/entities/Reservation';

interface UseUserReservationsReturn {
    reservations: Reservation[];
    allReservations: Reservation[];
    loading: boolean;
    error: string | null;
    searchTerm: string;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    handleSearch: (query: string) => void;
    cancelReservation: (reservationId: string) => Promise<void>;
    deliverReservation: (reservationId: string, novelty?: string) => Promise<void>;
    returnReservation: (reservationId: string, novelty?: string) => Promise<void>;
    reload: () => Promise<void>;
}

export const useUserReservations = (): UseUserReservationsReturn => {
    const { getUserReservationsUseCase, cancelReservationUseCase, deliverReservationUseCase, returnReservationUseCase } = useReservationDependencies();
    const { getCurrentUserUseCase } = useAuthDependencies();

    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('upcoming');

    const loadReservations = useCallback(async () => {
        const user = getCurrentUserUseCase.execute();
        if (!user) { setError('Usuario no autenticado'); setLoading(false); return; }
        setLoading(true); setError(null);
        try {
            const data = await getUserReservationsUseCase.execute(user.id);
            setReservations(data);
        } catch (err) {
            console.error('Error loading reservations:', err);
            setError((err as Error).message || 'Error al cargar las reservas');
        } finally {
            setLoading(false);
        }
    }, [getCurrentUserUseCase, getUserReservationsUseCase]);

    useEffect(() => { loadReservations(); }, [loadReservations]);

    const handleCancelReservation = async (reservationId: string): Promise<void> => {
        if (!window.confirm('¿Estás seguro de cancelar esta reserva?')) return;
        setLoading(true);
        try {
            await cancelReservationUseCase.execute(reservationId);
            await loadReservations();
        } catch (err) {
            console.error('Error cancelling reservation:', err);
            alert((err as Error).message || 'Error al cancelar la reserva');
        } finally {
            setLoading(false);
        }
    };

    const handleDeliverReservation = async (reservationId: string, novelty?: string): Promise<void> => {
        setLoading(true);
        try {
            await deliverReservationUseCase.execute(reservationId, novelty);
            await loadReservations();
        } catch (err) {
            console.error('Error delivering reservation:', err);
            setError((err as Error).message || 'Error al registrar la entrega');
        } finally {
            setLoading(false);
        }
    };

    const handleReturnReservation = async (reservationId: string, novelty?: string): Promise<void> => {
        setLoading(true);
        try {
            await returnReservationUseCase.execute(reservationId, novelty);
            await loadReservations();
        } catch (err) {
            console.error('Error returning reservation:', err);
            setError((err as Error).message || 'Error al registrar la devolución');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (query: string): void => { setSearchTerm(query); };

    const filteredReservations = useMemo((): Reservation[] => {
        return reservations.filter(res => {
            const matchesSearch =
                (res.locationName && res.locationName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (res.id && res.id.toString().includes(searchTerm));
            let matchesTab = true;
            if (activeTab === 'upcoming') matchesTab = res.isUpcoming() || res.isInProgress();
            else if (activeTab === 'past') matchesTab = (res.isPast() && res.isActive()) || res.isCompleted();
            else if (activeTab === 'cancelled') matchesTab = res.isCancelled();
            return matchesSearch && matchesTab;
        });
    }, [reservations, searchTerm, activeTab]);

    return {
        reservations: filteredReservations, allReservations: reservations, loading, error,
        searchTerm, activeTab, setActiveTab, handleSearch,
        cancelReservation: handleCancelReservation,
        deliverReservation: handleDeliverReservation,
        returnReservation: handleReturnReservation,
        reload: loadReservations
    };
};
