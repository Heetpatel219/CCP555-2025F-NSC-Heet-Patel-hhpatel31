#!/bin/bash

# Local AWS Setup Script for Fragments
# This script creates the necessary AWS resources in LocalStack and DynamoDB Local

set -e

echo "Setting up local AWS resources..."

# Wait for services to be ready
echo "Waiting for LocalStack..."
until curl -s http://localhost:4566/_localstack/health | grep -q '"s3": "available"'; do
  sleep 1
done
echo "LocalStack is ready!"

echo "Waiting for DynamoDB Local..."
until curl -s http://localhost:8000 > /dev/null 2>&1; do
  sleep 1
done
echo "DynamoDB Local is ready!"

# Configure AWS CLI for local development
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1

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
echo ""
echo "S3 Bucket: fragments (http://localhost:4566)"
echo "DynamoDB Table: fragments (http://localhost:8000)"

