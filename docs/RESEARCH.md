# Research: Asynchronous Message Brokering

## Objective
To determine the most reliable method for handling high-volume email notifications without impacting API latency.

## Why RabbitMQ?
* **Reliability**: Supports message durability and manual acknowledgments, ensuring emails aren't lost if a service crashes.
* **Complexity Handling**: Unlike Redis Pub/Sub, RabbitMQ offers built-in Dead Letter Exchanges (DLX) for automatic error handling.
* **Flow Control**: Using 'prefetch' settings prevents the Consumer from being overwhelmed by spikes in traffic.

## Findings
Asynchronous processing is essential for third-party integrations (like Email APIs) because external network latency is unpredictable.