const express = require('express');
const amqp = require('amqplib');
const app = express();
app.use(express.json());

const RABBITMQ_URL = `amqp://${process.env.RABBITMQ_HOST || 'localhost'}`;
const QUEUE_NAME = process.env.EMAIL_QUEUE_NAME || 'email_queue';

async function sendToQueue(data) {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
   await channel.assertQueue(QUEUE_NAME, { 
    durable: true, 
    arguments: { 
        'x-dead-letter-exchange': 'dlx.email', 
        'x-dead-letter-routing-key': 'email_fail' 
    } 
});
    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(data)), { persistent: true });
    setTimeout(() => connection.close(), 500);
}


app.post('/api/notifications/email', async (req, res) => {
    const { to, subject, body } = req.body;
    if (!to || !subject || !body || !to.includes('@')) {
        return res.status(400).json({ error: "Invalid input" });
    }

    try {
        await sendToQueue({ to, subject, body, retryCount: 0 });
        res.status(202).json({ message: "Notification accepted" });
    } catch (err) {
        res.status(500).json({ error: "Messaging system error" });
    }
});

app.listen(8000, () => console.log('Producer API running on port 8000'));