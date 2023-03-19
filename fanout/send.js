const amqplib = require("amqplib");
require('dotenv').config();

const sendMessage = async (msg) => {
    try {
        // Create connection
        const conn = await amqplib.connect(process.env.AMQP_URL);

        // Create channel
        const channel = await conn.createChannel();
        
        const EXCHANGE_NAME = 'fanout'

        await channel.assertExchange(EXCHANGE_NAME, 'fanout', { durable: false })

        channel.publish(EXCHANGE_NAME, '', Buffer.from(msg));
    } catch (error) {
        console.error('Error::', error.message)
    }
}

const message = process.argv[2] || "Hello world!"

sendMessage(message);