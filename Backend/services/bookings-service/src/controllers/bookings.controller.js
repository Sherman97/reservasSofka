const bookingsService = require("../services/bookings.service");
const bookingDispatcher = require("../dispatchers/booking.dispatcher");

async function createBooking(req, res) {
    try {
        const booking = await bookingDispatcher.dispatchCreateBooking({
            ...req.body,
            userId: req.user.id, // del token
        });
        return res.status(201).json({ ok: true, data: booking });
    } catch (err) {
        return handleError(err, res);
    }
}

async function listBookings(req, res) {
    try {
        const bookings = await bookingsService.listBookings(req.query);
        return res.json({ ok: true, data: bookings });
    } catch (err) {
        return handleError(err, res);
    }
}

async function getBookingById(req, res) {
    try {
        const booking = await bookingsService.getBookingById(req.params.id);
        return res.json({ ok: true, data: booking });
    } catch (err) {
        return handleError(err, res);
    }
}

async function cancelBooking(req, res) {
    try {
        const booking = await bookingsService.cancelBooking(req.params.id);
        return res.json({ ok: true, data: booking });
    } catch (err) {
        return handleError(err, res);
    }
}

// ✅ NUEVO: disponibilidad de un item en un rango
async function availability(req, res) {
    try {
        const { locationId, itemId, startAt, endAt } = req.query;

        const data = await bookingsService.getItemAvailability({
            locationId,
            itemId,
            startAt,
            endAt,
        });

        // opcional: respuesta “bonita”
        return res.json({
            ok: true,
            data: {
                ...data,
                available: data.availableQty > 0,
            },
        });
    } catch (err) {
        return handleError(err, res);
    }
}

function handleError(err, res) {
    if (err.statusCode) {
        return res.status(err.statusCode).json({ ok: false, message: err.message });
    }
    console.error(err);
    return res.status(500).json({ ok: false, message: "Internal server error" });
}

module.exports = {
    createBooking,
    listBookings,
    getBookingById,
    cancelBooking,
    availability,
};
