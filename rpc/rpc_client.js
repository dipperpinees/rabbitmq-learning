const amqplib = require("amqplib");
const { v4: uuid4 } = require("uuid");
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

const sendMessage = async (msg) => {
    try {
        const channel = await getChannel();

        const q = await channel.assertQueue("", { exclusive: true });

        const correlationId = uuid4();

        const QUEUE_NAME = "rpc_queue";
        channel.sendToQueue(QUEUE_NAME, Buffer.from(msg), {
            correlationId: correlationId,
            replyTo: q.queue
        })

        return new Promise(function(resolve, reject) {
            const timeout = setTimeout(() => {
                channel.close();
                resolve("API could not fullfil the request!");
            }, 8000);
            
            // Receive response
            channel.consume(q.queue, (msg) => {
                if (msg.properties.correlationId === correlationId) {
                    resolve(`Got response: ${msg.content.toString()}`);
                    clearTimeout(timeout);
                }
            }, {
                noAck: true
            })
        })
    } catch (error) {
        console.error("Error::", error.message);
    }
}

(async () => {
    const message = process.argv[2] || "Hello world!"

    const response = await sendMessage(message);

    console.log(response);
}) ()