import api from '../../../services/api';

export const getUserReservations = async (filter = 'all', searchTerm = '') => {
    try {
        const response = await api.get('/bookings');
        const reservations = response.data.data.map(repo => ({
            id: repo.id,
            title: `Reserva: ${repo.locationId}`,
            location: repo.locationId,
            date: new Date(repo.startAt).toLocaleDateString(),
            time: `${new Date(repo.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(repo.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            status: repo.status.toLowerCase(),
            statusLabel: repo.status === 'CONFIRMED' ? 'Confirmada' : (repo.status === 'CANCELLED' ? 'Cancelada' : repo.status),
            category: 'room' // Defaulting to room as bookings don't specify type clearly yet
        }));

        let filtered = reservations;

        // Filter by Status Tab
        if (filter === 'upcoming') {
            const now = new Date();
            filtered = reservations.filter(r => new Date(r.date) >= now && r.status !== 'cancelled');
        } else if (filter === 'past') {
            const now = new Date();
            filtered = reservations.filter(r => new Date(r.date) < now);
        } else if (filter === 'cancelled') {
            filtered = reservations.filter(r => r.status === 'cancelled');
        }

        // Filter by Search
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                item.title.toLowerCase().includes(term) ||
                item.location.toLowerCase().includes(term)
            );
        }

        return filtered;
    } catch (error) {
        console.error('Error fetching reservations:', error);
        throw error.response?.data || { message: 'Error al obtener las reservas' };
    }
};

