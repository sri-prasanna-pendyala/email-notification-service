# System Architecture

## Overview
The system follows an **Event-Driven Architecture** using a Producer-Consumer pattern.



## Components
1. **Producer (API)**: A Node.js Express server that validates requests and pushes messages to the Exchange.
2. **Message Broker (RabbitMQ)**: Routes messages from the Direct Exchange to the `email_queue`.
3. **Consumer (Worker)**: A background service that processes messages and handles retries.

## Fault Tolerance flow
If a message fails:
1. It is requeued up to 3 times.
2. After the limit, the Direct Exchange routes it to the **Dead Letter Queue (DLQ)** via a Dead Letter Exchange.