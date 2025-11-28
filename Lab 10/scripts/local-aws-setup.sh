#!/bin/bash

# Wait for services to be ready
echo "Waiting for LocalStack and DynamoDB Local to be ready..."
sleep 5

# Create S3 bucket in LocalStack
echo "Creating S3 bucket..."
aws --endpoint-url=http://localhost:4566 s3 mb s3://fragments 2>/dev/null || echo "Bucket already exists"

# Create DynamoDB table
echo "Creating DynamoDB table..."
aws --endpoint-url=http://localhost:8000 dynamodb create-table \
    --table-name fragments \
    --attribute-definitions \
        AttributeName=ownerId,AttributeType=S \
        AttributeName=id,AttributeType=S \
    --key-schema \
        AttributeName=ownerId,KeyType=HASH \
        AttributeName=id,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    2>/dev/null || echo "Table already exists"

echo "Local AWS setup complete!"

