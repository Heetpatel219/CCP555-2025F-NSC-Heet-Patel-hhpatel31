#!/bin/bash

# Script to create DynamoDB table
# Requires AWS CLI to be installed and configured

echo "Creating DynamoDB table 'fragments'..."

aws dynamodb create-table \
    --table-name fragments \
    --attribute-definitions \
        AttributeName=ownerId,AttributeType=S \
        AttributeName=id,AttributeType=S \
    --key-schema \
        AttributeName=ownerId,KeyType=HASH \
        AttributeName=id,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1

echo ""
echo "Waiting for table to become active..."
sleep 5

echo ""
echo "Verifying table status..."
aws dynamodb describe-table --table-name fragments --region us-east-1 \
    --query 'Table.{Name:TableName,Status:TableStatus,ARN:TableArn}'

echo ""
echo "DynamoDB table setup complete!"

