const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const bookingsRoutes = require("./routes/bookings.routes");

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Health
app.get("/health", (req, res) => {
    res.json({ ok: true, service: "bookings-service" });
});

// Routes
app.use("/bookings", bookingsRoutes);

// 404
app.use((req, res) => {
    res.status(404).json({ ok: false, message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ ok: false, message: "Internal server error" });
});

module.exports = app;
