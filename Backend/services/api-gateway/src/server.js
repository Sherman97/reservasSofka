if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const requiredEnv = [
  "AUTH_URL",
  "BOOKINGS_URL",
  "INVENTORY_URL",
  "LOCATIONS_URL"
];

requiredEnv.forEach(env => {
  if (!process.env[env]) {
    throw new Error(`Missing env variable: ${env}`);
  }
});

const app = express();

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
  credentials: true
}));

app.use(helmet());
app.use(morgan("combined"));

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, service: "gateway" });
});

const proxyConfig = (target) => ({
  target,
  changeOrigin: true,
  timeout: 5000,
  proxyTimeout: 5000,
  onError(err, req, res) {
    res.status(503).json({ error: "Service unavailable" });
  }
});

app.use("/auth", createProxyMiddleware(proxyConfig(process.env.AUTH_URL)));
app.use("/bookings", createProxyMiddleware(proxyConfig(process.env.BOOKINGS_URL)));
app.use("/inventory", createProxyMiddleware(proxyConfig(process.env.INVENTORY_URL)));
app.use("/locations", createProxyMiddleware(proxyConfig(process.env.LOCATIONS_URL)));

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Gateway running on port ${PORT}`);
});
