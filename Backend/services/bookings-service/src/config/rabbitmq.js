const amqp = require("amqplib");

let connection = null;
let channel = null;

const connectRabbitMQ = async () => {
    if (connection) return { connection, channel };

    try {
        const amqpServer = process.env.RABBITMQ_URL || "amqp://rabbitmq:5672";
        connection = await amqp.connect(amqpServer);
        channel = await connection.createChannel();
        console.log("✅ RabbitMQ connected");
        return { connection, channel };
    } catch (err) {
        console.error("❌ RabbitMQ connection failed", err);
        // Esperar un poco y reintentar o dejar que Docker reinicie el contenedor
        setTimeout(connectRabbitMQ, 5000);
    }
};

const getChannel = () => channel;

module.exports = { connectRabbitMQ, getChannel };
