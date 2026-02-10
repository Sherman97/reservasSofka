const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");

const app = express();
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true, service: "auth-service" }));

app.use("/auth", authRoutes);

app.use((req, res) => res.status(404).json({ ok: false, message: "Route not found" }));

module.exports = app;
