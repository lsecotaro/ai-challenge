#!/bin/bash
echo "Waiting for RabbitMQ to start..."
until curl -s http://localhost:15672/api/overview -u admin:admin; do
  echo "Waiting for RabbitMQ to become available..."
  sleep 2
done

# Declare the queue
echo "Creating queue 'my-queue'..."
curl -u admin:admin -X PUT -H "Content-Type: application/json" \
    -d '{"durable":true}' \
    http://localhost:15672/api/queues/%2f/vehicle_service_queue

echo "Queue 'my-queue' created."