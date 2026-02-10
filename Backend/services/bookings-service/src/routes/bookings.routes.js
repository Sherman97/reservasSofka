const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middlewares/auth.middleware");


const {
    createBooking,
    listBookings,
    getBookingById,
    cancelBooking
} = require("../controllers/bookings.controller");

// la IA no implementó el requireAuth, para proteger las rutas y que permiti que se realicen peticines sin token
// se debe agregar el requireAuth a todas las rutas y verificar que el token sea valido


router.post("/", requireAuth, createBooking);
router.get("/", requireAuth, listBookings);
router.get("/:id", requireAuth, getBookingById);
router.patch("/:id/cancel", requireAuth, cancelBooking);

module.exports = router;
