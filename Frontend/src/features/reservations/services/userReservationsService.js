import bookingsApi from '../../../services/bookingsApi';

export const getUserReservations = async (filter = 'all', searchTerm = '') => {
    try {
        const response = await bookingsApi.get('/listBookings');
        console.log("response", response);
        // Backend returns { ok: true, data: [...] }
        const rawData = response.data.data || [];

        const reservations = rawData.map(repo => ({
            id: repo.id,
            title: `Reserva: ${repo.location_id || repo.locationId}`,
            location: repo.location_id || repo.locationId,
            date: new Date(repo.start_at || repo.startAt).toLocaleDateString(),
            time: `${new Date(repo.start_at || repo.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(repo.end_at || repo.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            status: (repo.status || 'PENDING').toLowerCase(),
            statusLabel: repo.status === 'CONFIRMED' ? 'Confirmada' : (repo.status === 'CANCELLED' ? 'Cancelada' : 'Pendiente'),
            category: 'room'
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

