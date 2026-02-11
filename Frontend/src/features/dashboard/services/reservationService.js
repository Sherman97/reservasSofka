import api from '../../../services/api';

export const createReservation = async (reservationData) => {
    try {
        const response = await api.post('/bookings', reservationData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al crear la reserva' };
    }
};

export const availableEquipment = [
    { id: 1, name: "Proyector 4K", available: true, icon: "📽️" },
    { id: 2, name: "Cámara 4K para Streaming", available: true, icon: "📹" },
    { id: 3, name: "Pizarra Digital", available: true, icon: "📊" },
    { id: 4, name: "Adaptadores HDMI / USB-C", available: true, icon: "🔌" },
    { id: 5, name: "Sistema de Audio", available: true, icon: "🔊" },
    { id: 6, name: "Micrófonos de Solapa", available: false, icon: "🎤" },
    { id: 7, name: "Puntero Láser", available: true, icon: "📍" },
];

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

