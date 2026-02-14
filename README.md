Asynchronous Email Notification Service 📧
A high-performance, event-driven notification system built with Node.js and RabbitMQ. This service decouples the task of sending emails from the main application flow, ensuring system responsiveness and fault tolerance.

🎯 Project Overview
The goal of this project was to design a system capable of handling high-traffic notification requests without blocking the user experience. By leveraging an Event-Driven Architecture, the API returns an immediate response to the client while a background worker handles the heavy lifting of message processing and retries.

Key Challenges Overcome:
Service Orchestration: Solved ECONNREFUSED errors by implementing Docker health checks, ensuring the API and Consumer only attempt to connect once RabbitMQ is fully initialized.
Message Reliability: Configured Dead Letter Queues (DLQ) to prevent data loss when emails fail to send.
Resilience: Implemented exponential backoff logic and manual acknowledgments to handle transient failures.


🛠 Tech Stack
Node.js & Express: API Server (Producer)
RabbitMQ: Message Broker (AMQP)
amqplib: Client library for RabbitMQ integration
Docker & Docker Compose: Containerization and service orchestration


🏗 System Architecture
The service is divided into two main components:
1. Producer API (producer-api)
Endpoint: POST /api/notifications/email
Role: Validates incoming JSON payloads (recipient, subject, body).
Behavior: Publishes the notification data to the email_queue and immediately returns a 202 Accepted status.

2. Consumer Service (consumer-service)
Role: Acts as a background worker listening to the email_queue.
Behavior: Simulates email delivery (logging). It includes logic to handle failures by retrying or routing "poison" messages to the Dead Letter Queue.


Error Handling & Resilience
Direct Exchange: Uses a direct exchange for predictable routing.
Message Persistence: Messages are marked as persistent: true to survive RabbitMQ restarts.
Dead Letter Queue (DLQ): If a message exceeds MAX_RETRIES (3), it is automatically moved to dlq.email for manual inspection and recovery.
Manual Acknowledgments: Messages are only removed from the queue (ack) after the worker successfully "sends" the email.


🚀 Setup & Installation
Prerequisites:
Docker Desktop installed and running.

Running the Project:
1. Clone the repository to your local machine.
2. Navigate to the root directory (D:\my-notification-service).
3. Build and start the entire stack with a single command:
docker-compose up --build
4. Health Check: Access the RabbitMQ Management UI at http://localhost:15672 (Login: guest / guest).


📡 API Overview
Create Email Notification
POST /api/notifications/email

Request Body:
JSON
{
  "to": "dev@example.com",
  "subject": "System Update",
  "body": "The asynchronous service is running perfectly."
}
Response Codes:
202 Accepted: Message accepted and added to the queue.
400 Bad Request: Validation error (missing fields or invalid email format).
500 Internal Server Error: Could not connect to the message broker.


🧪 Testing the Flow
To verify the asynchronous nature of the system, use the following curl command in a separate terminal:
curl -X POST http://localhost:8000/api/notifications/email -H "Content-Type: application/json" -d "{\"to\": \"test@example.com\", \"subject\": \"Hello\", \"body\": \"Testing the worker\"}"
Observation: You will see the API respond instantly, while the consumer-service logs will show the email being processed a few milliseconds later.