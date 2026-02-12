if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

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


// ✅ IMPORTANTE: si mantienes esto, el gateway también necesita DB_*
const { initializeDatabase } = require("../../database/src/init");


// ✅ IMPORTANTE: si mantienes esto, el gateway también necesita DB_*
const { initializeDatabase } = require("../../database/src/init");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await initializeDatabase();
        app.listen(PORT, "0.0.0.0", () =>
            console.log(`🚪 Gateway on port ${PORT}`)
        );
    } catch (error) {
        console.error("❌ Failed to start server due to DB init error:", error);
        process.exit(1);
    }
};

startServer();
