require("dotenv").config();
const app = require("./app");

const { connectRabbitMQ } = require("./config/rabbitmq");
const { startInventoryWorker } = require("./workers/inventory.worker");

const PORT = process.env.PORT || 3005;

(async () => {
    await connectRabbitMQ();
    await startInventoryWorker();
    app.listen(PORT, "0.0.0.0", () =>
        console.log(`✅ inventory-service on port ${PORT}`)
    );
})();