// DynamoDB Document Client configuration
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const logger = require('../../../logger');

// Get AWS credentials and configuration
const getCredentials = () => {
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    const credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
    if (process.env.AWS_SESSION_TOKEN) {
      credentials.sessionToken = process.env.AWS_SESSION_TOKEN;
    }
    return credentials;
  }
  return undefined;
};

// DynamoDB Client configuration
const ddbClientConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
};

// Add credentials if available
const credentials = getCredentials();
if (credentials) {
  ddbClientConfig.credentials = credentials;
}

// Use local DynamoDB if endpoint is specified
if (process.env.AWS_DYNAMODB_ENDPOINT_URL) {
  ddbClientConfig.endpoint = process.env.AWS_DYNAMODB_ENDPOINT_URL;
  logger.info(`Using DynamoDB Local at ${process.env.AWS_DYNAMODB_ENDPOINT_URL}`);
}

// Create the base DynamoDB client
const ddbClient = new DynamoDBClient(ddbClientConfig);

// Create the Document Client wrapper
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

module.exports = ddbDocClient;

