const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const locationsRoutes = require("./routes/locations.routes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/locations", locationsRoutes);

app.get("/health", (req, res) => {
    res.json({ ok: true, service: "locations-service" });
});

module.exports = app;
