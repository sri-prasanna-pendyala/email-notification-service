const amqp = require('amqplib');
const RABBITMQ_URL = `amqp://${process.env.RABBITMQ_HOST}`;
const QUEUE = process.env.EMAIL_QUEUE_NAME;
const DLQ = process.env.DEAD_LETTER_QUEUE;
const MAX_RETRIES = parseInt(process.env.MAX_RETRIES) || 3;

async function startConsumer() {
    const conn = await amqp.connect(RABBITMQ_URL);
    const channel = await conn.createChannel();

    // Setup DLX and Queues
    await channel.assertExchange('dlx.email', 'direct', { durable: true });
    await channel.assertQueue(DLQ, { durable: true });
    await channel.bindQueue(DLQ, 'dlx.email', 'email_fail');

    await channel.assertQueue(QUEUE, {
        durable: true,
        arguments: { 'x-dead-letter-exchange': 'dlx.email', 'x-dead-letter-routing-key': 'email_fail' }
    });

    console.log("Consumer waiting for messages...");
    channel.consume(QUEUE, async (msg) => {
        const content = JSON.parse(msg.content.toString());
        
        try {
            // Simulate 10% failure
            if (Math.random() < 0.1) throw new Error("Simulated Provider Down");

            console.log(`Email sent to ${content.to} with subject: ${content.subject}`);
            channel.ack(msg);
        } catch (err) {
            const retryCount = (content.retryCount || 0) + 1;
            if (retryCount <= MAX_RETRIES) {
                console.log(`Retry ${retryCount}/${MAX_RETRIES} for ${content.to}`);
                content.retryCount = retryCount;
                channel.ack(msg); // Remove old message
                channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(content))); // Re-queue
            } else {
                console.log(`Moving to DLQ: ${content.to}`);
                channel.reject(msg, false); // false = don't requeue, moves to DLX
            }
        }
    });
}
startConsumer();