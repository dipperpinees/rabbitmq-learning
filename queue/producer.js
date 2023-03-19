const amqplib = require("amqplib");
require('dotenv').config();

const sendToQueue = async (msg) => {
    try {
        // Create connection
        const conn = await amqplib.connect(process.env.AMQP_URL);

        // Create channel
        const channel = await conn.createChannel();

        const QUEUE_NAME = 'q';

        await channel.assertQueue(QUEUE_NAME, {
            durable: false
        });

        await channel.sendToQueue(QUEUE_NAME, Buffer.from(msg))
    } catch (error) {
        console.error('Error::', error.message)
    }
}

const message = process.argv[2] || "Hello world!"

setInterval(() => {
    sendToQueue(message);
}, 2000)