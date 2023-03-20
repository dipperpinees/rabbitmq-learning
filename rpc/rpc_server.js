const amqplib = require("amqplib");
require('dotenv').config();

let conn = null;

/**
 * 
 * @returns {amqplib.Channel}
 */
const getChannel = async () => {
    if (conn === null) {
        conn = await amqplib.connect(process.env.AMQP_URL)
    }
    
    return await conn.createChannel();
}

const receiveMessage = async () => {
    try {
        const channel = await getChannel();

        const QUEUE_NAME = "rpc_queue";

        await channel.assertQueue(QUEUE_NAME, {durable: false});
        await channel.prefetch(1);

        channel.consume(QUEUE_NAME, (msg) => {
            console.log("Reveive message:::", msg.content.toString());
            const response = `Response`;

            channel.sendToQueue(msg.properties.replyTo, Buffer.from(response), {
                correlationId: msg.properties.correlationId
            })

            channel.ack(msg);
        })
    } catch (error) {
        console.error("Error::", error.message);
    }
}

receiveMessage();