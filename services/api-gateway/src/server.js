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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚪 Gateway on http://localhost:${PORT}`));
