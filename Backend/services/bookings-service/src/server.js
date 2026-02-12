if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const app = require("./app");

const PORT = process.env.PORT || 3003;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ bookings-service on port ${PORT}`);
});
