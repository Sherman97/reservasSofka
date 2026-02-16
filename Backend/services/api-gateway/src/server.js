require("dotenv").config();
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.get("/health", (req, res) => res.json({ ok: true, service: "gateway" }));

app.use("/auth", createProxyMiddleware({ target: process.env.AUTH_URL, changeOrigin: true }));
app.use("/bookings", createProxyMiddleware({ target: process.env.BOOKINGS_URL, changeOrigin: true }));
app.use("/inventory", createProxyMiddleware({ target: process.env.INVENTORY_URL, changeOrigin: true }));
app.use("/locations", createProxyMiddleware({ target: process.env.LOCATIONS_URL, changeOrigin: true }));

const { initializeDatabase } = require("../../database/src/init");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await initializeDatabase();
        app.listen(PORT, () => console.log(`🚪 Gateway on http://localhost:${PORT}`));
    } catch (error) {
        console.error("❌ Failed to start server due to DB init error:", error);
        process.exit(1);
    }
};

startServer();
