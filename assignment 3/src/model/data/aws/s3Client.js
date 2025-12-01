// S3 Client for fragment data storage

const { S3Client } = require('@aws-sdk/client-s3');
const logger = require('../../../logger');

/**
 * Create and configure an S3 client
 * Uses environment variables for configuration and supports LocalStack for local development
 */
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  // Use custom endpoint for LocalStack in development
  ...(process.env.AWS_S3_ENDPOINT_URL && {
    endpoint: process.env.AWS_S3_ENDPOINT_URL,
    forcePathStyle: true,
  }),
});

logger.info(
  { region: process.env.AWS_REGION, endpoint: process.env.AWS_S3_ENDPOINT_URL },
  'S3 client configured'
);

module.exports = s3Client;

