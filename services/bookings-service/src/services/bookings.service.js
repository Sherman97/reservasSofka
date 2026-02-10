const crypto = require("crypto");

const bookings = [];

function createBooking(payload) {
    const { userId, locationId, startAt, endAt, items } = payload || {};

    if (!userId || !locationId || !startAt || !endAt) {
        throwError(400, "userId, locationId, startAt y endAt son obligatorios");
    }

    const start = new Date(startAt);
    const end = new Date(endAt);

    if (start >= end) {
        throwError(400, "startAt debe ser menor que endAt");
    }

    const conflict = bookings.find(b =>
        b.locationId === locationId &&
        b.status === "CONFIRMED" &&
        start < new Date(b.endAt) &&
        end > new Date(b.startAt)
    );

    if (conflict) {
        throwError(409, "La locación ya está reservada en ese rango de tiempo");
    }

    const booking = {
        id: crypto.randomUUID(),
        userId,
        locationId,
        startAt: start.toISOString(),
        endAt: end.toISOString(),
        items: Array.isArray(items) ? items : [],
        status: "CONFIRMED",
        createdAt: new Date().toISOString()
    };

    bookings.push(booking);
    return booking;
}

function listBookings(filters = {}) {
    let result = [...bookings];

    if (filters.userId) {
        result = result.filter(b => b.userId === filters.userId);
    }

    if (filters.locationId) {
        result = result.filter(b => b.locationId === filters.locationId);
    }

    if (filters.status) {
        result = result.filter(b => b.status === filters.status);
    }

    return result;
}

function getBookingById(id) {
    const booking = bookings.find(b => b.id === id);
    if (!booking) {
        throwError(404, "Reserva no encontrada");
    }
    return booking;
}

function cancelBooking(id) {
    const booking = getBookingById(id);

    if (booking.status === "CANCELLED") {
        throwError(400, "La reserva ya está cancelada");
    }

    booking.status = "CANCELLED";
    booking.cancelledAt = new Date().toISOString();
    return booking;
}

function throwError(statusCode, message) {
    const e = new Error(message);
    e.statusCode = statusCode;
    throw e;
}

module.exports = {
    createBooking,
    listBookings,
    getBookingById,
    cancelBooking
};
