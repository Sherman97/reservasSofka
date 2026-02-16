const { getChannel } = require("../config/rabbitmq");

const startInventoryWorker = async () => {
    const channel = getChannel();
    if (!channel) {
        console.error("❌ RabbitMQ channel not available for worker");
        return;
    }

    const exchange = "bookings_exchange";
    const queue = "inventory_updates_queue";
    const routingKey = "booking.created";

    try {
        await channel.assertExchange(exchange, "topic", { durable: true });
        await channel.assertQueue(queue, { durable: true });
        await channel.bindQueue(queue, exchange, routingKey);

        console.log("✅ Inventory Worker waiting for messages...");

        channel.consume(queue, (msg) => {
            if (msg !== null) {
                try {
                    const content = JSON.parse(msg.content.toString());
                    console.log(`📥 Received event: ${routingKey}`, content);

                    // Aquí iría la lógica para actualizar inventario o logs

                    channel.ack(msg);
                } catch (e) {
                    console.error("❌ Error processing message", e);
                    channel.nack(msg, false, false); // o true para requeue
                }
            }
        });
    } catch (error) {
        console.error("❌ Error starting inventory worker:", error);
    }
};

module.exports = { startInventoryWorker };
