const { getChannel } = require("../config/rabbitmq");

const publishEvent = async (routingKey, data) => {
    const channel = getChannel();
    if (!channel) {
        console.error("❌ RabbitMQ channel not available");
        return;
    }
    const exchange = "bookings_exchange";

    try {
        await channel.assertExchange(exchange, "topic", { durable: true });
        const message = JSON.stringify(data);
        channel.publish(exchange, routingKey, Buffer.from(message));
        console.log(`📤 Event published to ${exchange}: ${routingKey}`);
    } catch (error) {
        console.error("❌ Error publishing event:", error);
    }
};

module.exports = { publishEvent };
