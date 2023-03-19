const amqplib = require("amqplib");
require('dotenv').config();

const receiveQueue = async () => {
    try {
        // Create connection
        const conn = await amqplib.connect(process.env.AMQP_URL);

        // Create channel
        const channel = await conn.createChannel();

        const QUEUE_NAME = 'q';

        await channel.assertQueue(QUEUE_NAME, {
            durable: false
        });

        await channel.consume(QUEUE_NAME, (msg) => {
            console.log("Msg::", msg.content.toString())

            channel.ack(msg);
        })
    } catch (error) {
        console.error('Error::', error.message)
    }
}

receiveQueue()