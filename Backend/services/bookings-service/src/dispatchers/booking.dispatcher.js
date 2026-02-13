const bookingsService = require("../services/bookings.service");
const { publishBookingCreated } = require("../infra/rmq.publisher");

async function dispatchCreateBooking(payload) {
    const booking = await bookingsService.createBooking(payload);

    try {
        await publishBookingCreated({
            type: "BOOKING_CREATED",
            bookingId: booking.id,
            locationId: booking.locationId,
            startAt: booking.startAt,
            endAt: booking.endAt,
            timestamp: new Date().toISOString(),
        });
    } catch (_) {
        // Publishing must not affect booking creation
    }

    return booking;
}

module.exports = { dispatchCreateBooking };
