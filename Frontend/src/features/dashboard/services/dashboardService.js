export const mockItems = [
    {
        id: 1,
        name: "Sala de Innovación A",
        type: "Room",
        location: "Ala Norte, Piso 4",
        capacity: 8,
        tags: ["Proyector 4K", "Pizarra"],
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80",
        available: true
    },
    {
        id: 2,
        name: "Focus Booth 04",
        type: "Room",
        location: "Zona Silenciosa, Piso 2",
        capacity: 2,
        tags: ["Aislante Acústico"],
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80",
        available: true
    },
    {
        id: 3,
        name: "Kit Wireless Casting",
        type: "Equipment",
        category: "Tech",
        location: "Almacén Central",
        tags: ["USB-C", "Apple TV"],
        image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80",
        available: true
    },
    {
        id: 4,
        name: "Sala de Juntas B",
        type: "Room",
        location: "Piso 5, Dirección",
        capacity: 12,
        tags: ["Videoconferencia", "Coffee Bar"],
        image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80",
        available: true
    },
    {
        id: 5,
        name: "Auriculares Studio Pro",
        type: "Equipment",
        category: "Tech",
        location: "Almacén Central",
        tags: ["Cancelación Ruido"],
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80",
        available: true
    },
    {
        id: 6,
        name: "Proyector Láser 4K",
        type: "Equipment",
        category: "Portátil",
        location: "Almacén Central",
        tags: ["3000 Lumens", "HDMI 2.1"],
        image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80",
        available: true
    }
];

export const getItems = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockItems;
};
