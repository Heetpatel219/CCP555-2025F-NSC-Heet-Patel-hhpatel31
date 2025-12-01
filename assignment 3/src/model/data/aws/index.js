// AWS backend implementation for fragment storage
// Uses DynamoDB for metadata and S3 for fragment data

const s3Client = require('./s3Client');
const ddbDocClient = require('./ddbDocClient');
const { PutCommand, GetCommand, QueryCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const logger = require('../../../logger');

// Get table and bucket names from environment
const TableName = process.env.AWS_DYNAMODB_TABLE_NAME || 'fragments';
const BucketName = process.env.AWS_S3_BUCKET_NAME || 'fragments';

/**
 * Write fragment metadata to DynamoDB
 */
async function writeFragment(fragment) {
  const params = {
    TableName,
    Item: fragment,
  };

  const command = new PutCommand(params);
  try {
    await ddbDocClient.send(command);
    logger.debug({ fragment }, 'Wrote fragment metadata to DynamoDB');
  } catch (err) {
    logger.error({ err, params }, 'Error writing fragment metadata to DynamoDB');
    throw err;
  }
}

/**
 * Read fragment metadata from DynamoDB
 */
async function readFragment(ownerId, id) {
  const params = {
    TableName,
    Key: { ownerId, id },
  };

  const command = new GetCommand(params);
  try {
    const data = await ddbDocClient.send(command);
    logger.debug({ data }, 'Read fragment metadata from DynamoDB');
    return data?.Item;
  } catch (err) {
    logger.error({ err, params }, 'Error reading fragment metadata from DynamoDB');
    throw err;
  }
}

/**
 * Write fragment data to S3
 */
async function writeFragmentData(ownerId, id, data) {
  const params = {
    Bucket: BucketName,
    Key: `${ownerId}/${id}`,
    Body: data,
  };

  const command = new PutObjectCommand(params);
  try {
    await s3Client.send(command);
    logger.debug({ ownerId, id }, 'Wrote fragment data to S3');
  } catch (err) {
    logger.error({ err, params }, 'Error writing fragment data to S3');
    throw err;
  }
}

/**
 * Read fragment data from S3
 */
async function readFragmentData(ownerId, id) {
  const params = {
    Bucket: BucketName,
    Key: `${ownerId}/${id}`,
  };

  const command = new GetObjectCommand(params);
  try {
    const data = await s3Client.send(command);
    // Convert the stream to a buffer
    return Buffer.from(await data.Body.transformToByteArray());
  } catch (err) {
    logger.error({ err, params }, 'Error reading fragment data from S3');
    throw err;
  }
}

/**
 * List all fragment IDs for a user from DynamoDB
 */
async function listFragments(ownerId, expand = false) {
  const params = {
    TableName,
    KeyConditionExpression: 'ownerId = :ownerId',
    ExpressionAttributeValues: {
      ':ownerId': ownerId,
    },
  };

  // If not expanding, only get the id attribute
  if (!expand) {
    params.ProjectionExpression = 'id';
  }

  const command = new QueryCommand(params);
  try {
    const data = await ddbDocClient.send(command);
    logger.debug({ data }, 'Listed fragments from DynamoDB');

    if (expand) {
      return data?.Items || [];
    }
    return data?.Items?.map((item) => item.id) || [];
  } catch (err) {
    logger.error({ err, params }, 'Error listing fragments from DynamoDB');
    throw err;
  }
}

/**
 * Delete fragment metadata from DynamoDB and data from S3
 */
async function deleteFragment(ownerId, id) {
  // Delete from DynamoDB
  const ddbParams = {
    TableName,
    Key: { ownerId, id },
  };

  const ddbCommand = new DeleteCommand(ddbParams);
  try {
    await ddbDocClient.send(ddbCommand);
    logger.debug({ ownerId, id }, 'Deleted fragment metadata from DynamoDB');
  } catch (err) {
    logger.error({ err, ddbParams }, 'Error deleting fragment metadata from DynamoDB');
    throw err;
  }

  // Delete from S3
  const s3Params = {
    Bucket: BucketName,
    Key: `${ownerId}/${id}`,
  };

  const s3Command = new DeleteObjectCommand(s3Params);
  try {
    await s3Client.send(s3Command);
    logger.debug({ ownerId, id }, 'Deleted fragment data from S3');
  } catch (err) {
    logger.error({ err, s3Params }, 'Error deleting fragment data from S3');
    throw err;
  }
}

module.exports = {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  listFragments,
  deleteFragment,
};

