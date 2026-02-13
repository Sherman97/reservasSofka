const amqp = require("amqplib");

async function publishBookingCreated(event) {
    const host = process.env.RABBITMQ_HOST || "rabbitmq";
    const port = process.env.RABBITMQ_PORT || "5672";
    const url = `amqp://${host}:${port}`;

    let connection;
    let channel;

    try {
        connection = await amqp.connect(url);
        channel = await connection.createChannel();

        const exchange = "bookings.exchange";
        const routingKey = "booking.created";

        await channel.assertExchange(exchange, "direct", { durable: true });

        const payload = Buffer.from(JSON.stringify(event));
        channel.publish(exchange, routingKey, payload, { persistent: true });
    } catch (err) {
        console.error("[RMQ] Failed to publish booking.created", err);
    } finally {
        try {
            if (channel) await channel.close();
        } catch (_) {}
        try {
            if (connection) await connection.close();
        } catch (_) {}
    }
}

module.exports = { publishBookingCreated };
