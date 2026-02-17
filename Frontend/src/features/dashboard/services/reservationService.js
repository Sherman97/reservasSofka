import bookingsApi from '../../../services/bookingsApi';
import inventoryApi from '../../../services/inventoryApi';

export const createReservation = async (reservationData) => {
    try {
        // Format data for backend
        // Combine date and time into ISO strings for backend (local time aware)
        const [year, month, day] = reservationData.date.split('-').map(Number);
        const [startHours, startMinutes] = reservationData.startTime.split(':').map(Number);
        const [endHours, endMinutes] = reservationData.endTime.split(':').map(Number);

        const startAt = new Date(year, month - 1, day, startHours, startMinutes).toISOString();
        const endAt = new Date(year, month - 1, day, endHours, endMinutes).toISOString();

        const payload = {
            spaceId: reservationData.spaceId || reservationData.locationId,
            startAt,
            endAt,
            title: reservationData.title || `Reserva de ${reservationData.spaceName}`,
            attendeesCount: reservationData.attendeesCount || 1,
            notes: reservationData.notes || '',
            items: (reservationData.items || []).map(id => ({
                itemId: typeof id === 'object' ? (id.itemId || id.id) : id,
                qty: 1
            }))
        };

        const response = await bookingsApi.post('/bookings/createBooking', payload);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating reservation:', error);
        throw error.response?.data || { message: 'Error al crear la reserva' };
    }
};

export const fetchEquipment = async (cityId) => {
    try {
        const response = await inventoryApi.get('/items/listItems', {
            params: { city_id: cityId }
        });

        const rawItems = response.data.data || [];
        console.log(rawItems);
        // Map to format used by EquipmentSelector
        return rawItems.map(item => ({
            id: item.id,
            name: item.name,
            available: item.status === 'available',
        }));
    } catch (error) {
        console.error('Error fetching equipment:', error);
        return [];
    }
};


// Generate mock availability for the current month
export const getAvailabilityForMonth = (year, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const availability = {};

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();

        // Weekends are unavailable, some random weekdays too
        availability[day] = {
            available: dayOfWeek !== 0 && dayOfWeek !== 6 && Math.random() > 0.3,
            slots: {
                morning: Math.random() > 0.5,
                afternoon: Math.random() > 0.5,
                fullDay: Math.random() > 0.7
            }
        };
    }

    return availability;
};

