const bookingsService = require("../services/bookings.service");

function createBooking(req, res) {
    try {
        const booking = bookingsService.createBooking({
            ...req.body,
            userId: req.user.id
        });
        return res.status(201).json({ ok: true, data: booking });
    } catch (err) {
        return handleError(err, res);
    }
}

function listBookings(req, res) {
    try {
        const bookings = bookingsService.listBookings(req.query);
        return res.json({ ok: true, data: bookings });
    } catch (err) {
        return handleError(err, res);
    }
}

function getBookingById(req, res) {
    try {
        const booking = bookingsService.getBookingById(req.params.id);
        return res.json({ ok: true, data: booking });
    } catch (err) {
        return handleError(err, res);
    }
}

function cancelBooking(req, res) {
    try {
        const booking = bookingsService.cancelBooking(req.params.id);
        return res.json({ ok: true, data: booking });
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
    cancelBooking
};
