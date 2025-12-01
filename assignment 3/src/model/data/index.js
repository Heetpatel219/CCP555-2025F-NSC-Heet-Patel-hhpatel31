// Data layer that switches between memory and AWS backends
// Based on environment configuration

const logger = require('../../logger');

// Determine which backend to use based on environment
// Use AWS if any AWS endpoint is configured, otherwise use memory
const useAws =
  process.env.AWS_S3_BUCKET_NAME ||
  process.env.AWS_DYNAMODB_TABLE_NAME ||
  (process.env.AWS_S3_ENDPOINT_URL && process.env.AWS_DYNAMODB_ENDPOINT_URL);

let backend;

if (useAws) {
  logger.info('Using AWS backend for fragment storage');
  backend = require('./aws');
} else {
  logger.info('Using in-memory backend for fragment storage');
  backend = require('./memory');
}

module.exports = backend;
