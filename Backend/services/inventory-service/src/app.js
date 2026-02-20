const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const itemsRoutes = require("./routes/items.routes");
const locationItemsRoutes = require("./routes/locationItems.routes");

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true, service: "inventory-service" }));

app.use("/items", itemsRoutes);
app.use("/locations", locationItemsRoutes);

app.use((req, res) => res.status(404).json({ ok: false, message: "Route not found" }));

module.exports = app;
