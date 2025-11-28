// AWS Data Access Layer - DynamoDB for metadata, S3 for data
const { PutCommand, GetCommand, QueryCommand, DeleteCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const ddbDocClient = require('./ddbDocClient');
const s3Client = require('./s3Client');
const logger = require('../../../logger');

const TABLE_NAME = process.env.AWS_DYNAMODB_TABLE_NAME || 'fragments';
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'fragments';

// Write fragment metadata to DynamoDB
// Accepts (ownerId, id, fragment) for compatibility with memory implementation
async function writeFragment(ownerId, id, fragment) {
  // Ensure ownerId and id are in the fragment object
  const item = {
    ...fragment,
    ownerId: fragment.ownerId || ownerId,
    id: fragment.id || id,
  };
  const params = {
    TableName: TABLE_NAME,
    Item: item,
  };
  try {
    await ddbDocClient.send(new PutCommand(params));
    logger.debug({ fragment: item }, 'Fragment metadata written to DynamoDB');
  } catch (err) {
    logger.error({ err, fragment: item }, 'Error writing fragment to DynamoDB');
    throw err;
  }
}

// Read fragment metadata from DynamoDB
async function readFragment(ownerId, id) {
  const params = {
    TableName: TABLE_NAME,
    Key: { ownerId, id },
  };
  try {
    const { Item } = await ddbDocClient.send(new GetCommand(params));
    return Item;
  } catch (err) {
    logger.error({ err, ownerId, id }, 'Error reading fragment from DynamoDB');
    throw err;
  }
}

// Write fragment data to S3
async function writeFragmentData(ownerId, id, data) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: `${ownerId}/${id}`,
    Body: data,
  };
  try {
    await s3Client.send(new PutObjectCommand(params));
    logger.debug({ ownerId, id }, 'Fragment data written to S3');
  } catch (err) {
    logger.error({ err, ownerId, id }, 'Error writing fragment data to S3');
    throw err;
  }
}

// Read fragment data from S3
async function readFragmentData(ownerId, id) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: `${ownerId}/${id}`,
  };
  try {
    const { Body } = await s3Client.send(new GetObjectCommand(params));
    // Convert stream to buffer
    const chunks = [];
    for await (const chunk of Body) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  } catch (err) {
    logger.error({ err, ownerId, id }, 'Error reading fragment data from S3');
    throw err;
  }
}

// List all fragments for a user from DynamoDB
async function listFragments(ownerId, expand = false) {
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: 'ownerId = :ownerId',
    ExpressionAttributeValues: { ':ownerId': ownerId },
  };

  if (!expand) {
    params.ProjectionExpression = 'id';
  }

  try {
    const { Items } = await ddbDocClient.send(new QueryCommand(params));
    return expand ? Items : Items.map((item) => item.id);
  } catch (err) {
    logger.error({ err, ownerId }, 'Error listing fragments from DynamoDB');
    throw err;
  }
}

// Delete fragment from both DynamoDB and S3
async function deleteFragment(ownerId, id) {
  try {
    // Delete from DynamoDB
    await ddbDocClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { ownerId, id },
    }));

    // Delete from S3
    await s3Client.send(new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `${ownerId}/${id}`,
    }));

    logger.debug({ ownerId, id }, 'Fragment deleted from DynamoDB and S3');
  } catch (err) {
    logger.error({ err, ownerId, id }, 'Error deleting fragment');
    throw err;
  }
}

// Find a fragment by ID across all owners (inefficient but required for API compatibility)
// Uses Scan operation - not recommended for production but works for this use case
async function findFragmentById(id) {
  const params = {
    TableName: TABLE_NAME,
    FilterExpression: 'id = :id',
    ExpressionAttributeValues: {
      ':id': id,
    },
  };

  try {
    const { Items } = await ddbDocClient.send(new ScanCommand(params));
    // Return the first matching item, or undefined if none found
    return Items?.[0];
  } catch (err) {
    logger.error({ err, id }, 'Error finding fragment by ID in DynamoDB');
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
  findFragmentById,
};
