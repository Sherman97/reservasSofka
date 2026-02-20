export const getUserReservations = (filter = 'all', searchTerm = '') => {
    const reservations = [
        {
            id: 1,
            title: "Sala de Conferencias B",
            location: "PLANTA 3 • SALA GRANDE",
            date: "24 Oct, 2023",
            time: "09:00 - 11:00",
            status: "active", // En curso
            statusLabel: "En curso",
            image: "door-icon", // Placeholder for icon logic
            category: "room"
        },
        {
            id: 2,
            title: 'MacBook Pro 16"',
            location: "EQUIPAMIENTO IT • ID-4522",
            date: "26 Oct, 2023",
            time: "Todo el día",
            status: "confirmed",
            statusLabel: "Confirmada",
            image: "laptop-icon",
            category: "equipment"
        },
        {
            id: 3,
            title: "Sala Creativa A1",
            location: "PLANTA 1 • PIZARRAS TÁCTILES",
            date: "30 Oct, 2023",
            time: "14:00 - 15:30",
            status: "confirmed",
            statusLabel: "Confirmada",
            image: "people-icon",
            category: "room"
        },
        {
            id: 4,
            title: "Kit Streaming Pro",
            location: "AUDIO & VIDEO • REF-001",
            date: "02 Nov, 2023",
            time: "10:00 - 18:00",
            status: "pending",
            statusLabel: "Pendiente",
            image: "video-icon",
            category: "equipment"
        }
    ];

    return new Promise((resolve) => {
        setTimeout(() => {
            let filtered = reservations;

            // Filter by Status Tab
            if (filter === 'upcoming') {
                // For mock, let's just return all for 'Proximas' except cancelled or past if we had them
                // In real app, date comparison needed.
                filtered = reservations;
            } else if (filter === 'past') {
                filtered = []; // Empty for now
            } else if (filter === 'cancelled') {
                filtered = []; // Empty for now
            }

            // Filter by Search
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                filtered = filtered.filter(item =>
                    item.title.toLowerCase().includes(term) ||
                    item.location.toLowerCase().includes(term)
                );
            }

            resolve(filtered);
        }, 500);
    });
};
