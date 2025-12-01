// DynamoDB Document Client for fragment metadata storage

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const logger = require('../../../logger');

/**
 * Create and configure a DynamoDB client
 * Uses environment variables for configuration and supports DynamoDB Local for development
 */
const ddbClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  // Use custom endpoint for DynamoDB Local in development
  ...(process.env.AWS_DYNAMODB_ENDPOINT_URL && {
    endpoint: process.env.AWS_DYNAMODB_ENDPOINT_URL,
  }),
});

// Create a DynamoDB Document Client with marshalling options
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

logger.info(
  { region: process.env.AWS_REGION, endpoint: process.env.AWS_DYNAMODB_ENDPOINT_URL },
  'DynamoDB client configured'
);

module.exports = ddbDocClient;

