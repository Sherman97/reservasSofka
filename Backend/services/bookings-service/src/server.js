if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const app = require("./app");
const { connectRabbitMQ } = require("./config/rabbitmq");

const PORT = process.env.PORT || 3003;

(async () => {
    await connectRabbitMQ();
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`✅ bookings-service on port ${PORT}`);
    });
})();
