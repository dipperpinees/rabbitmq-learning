const amqplib = require("amqplib");
require('dotenv').config();

const receiveMessage = async (msg) => {
    try {
        // Create connection
        const conn = await amqplib.connect(process.env.AMQP_URL);

        // Create channel
        const channel = await conn.createChannel();
        
        const EXCHANGE_NAME = 'direct'

        await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: false })

        const q = await channel.assertQueue("", { exclusive: true });

        channel.bindQueue(q.queue, EXCHANGE_NAME, 'routing_key');

        channel.consume(q.queue, (msg) => {
            console.log(`${msg.fields.routingKey}: ${msg.content.toString()}`);
        }, {
            noAck: true,
        });
    } catch (error) {
        console.error('Error::', error.message)
    }
}

receiveMessage();