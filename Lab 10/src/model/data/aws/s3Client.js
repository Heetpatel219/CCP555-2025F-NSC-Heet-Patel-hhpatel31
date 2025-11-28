// S3 Client configuration
const { S3Client } = require('@aws-sdk/client-s3');
const logger = require('../../../logger');

// Get AWS credentials
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

// S3 Client configuration
const s3ClientConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
};

// Add credentials if available
const credentials = getCredentials();
if (credentials) {
  s3ClientConfig.credentials = credentials;
}

// Use LocalStack if endpoint is specified
if (process.env.AWS_S3_ENDPOINT_URL) {
  s3ClientConfig.endpoint = process.env.AWS_S3_ENDPOINT_URL;
  s3ClientConfig.forcePathStyle = true;
  logger.info(`Using LocalStack S3 at ${process.env.AWS_S3_ENDPOINT_URL}`);
}

const s3Client = new S3Client(s3ClientConfig);

module.exports = s3Client;

