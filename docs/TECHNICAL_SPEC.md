# Technical Specification

## Data Structures
### Email Message (JSON)
- `to`: String (Validated email format)
- `subject`: String (Non-empty)
- `body`: String (Non-empty)
- `retryCount`: Number (Internal tracker)

## Environment Variables
- `RABBITMQ_HOST`: Hostname for the broker.
- `MAX_RETRIES`: Maximum number of failed attempts before DLQ.

## Error Codes
- `202 Accepted`: Successfully queued.
- `400 Bad Request`: Input validation failed.
- `500 Internal Server Error`: RabbitMQ connection failure.