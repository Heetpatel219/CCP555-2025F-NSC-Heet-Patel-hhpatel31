const Fragment = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

/**
 * GET /v1/fragments/:id/tags
 * Get tags for a fragment
 */
const getTags = async (req, res) => {
  const { id } = req.params;

  try {
    const fragment = await Fragment.byId(req.user, id);

    res.status(200).json(
      createSuccessResponse({
        id: fragment.id,
        tags: fragment.tags || [],
      })
    );
  } catch (err) {
    logger.error({ err, id }, 'Error getting fragment tags');
    if (err.message.includes('not found')) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};

/**
 * POST /v1/fragments/:id/tags
 * Add tags to a fragment
 * Body: { tags: ["tag1", "tag2"], autoLabel: boolean }
 */
const addTags = async (req, res) => {
  const { id } = req.params;
  const { tags, autoLabel } = req.body || {};

  try {
    const fragment = await Fragment.byId(req.user, id);
    let addedTags = [];

    // Auto-label images using Rekognition
    if (autoLabel && fragment.isImage()) {
      try {
        const { RekognitionClient, DetectLabelsCommand } = require('@aws-sdk/client-rekognition');
        const client = new RekognitionClient({ region: process.env.AWS_REGION || 'us-east-1' });

        const data = await fragment.getData();
        const command = new DetectLabelsCommand({
          Image: { Bytes: data },
          MaxLabels: 10,
          MinConfidence: 70,
        });

        const result = await client.send(command);
        addedTags = result.Labels.map((label) => label.Name.toLowerCase());
        logger.info({ id, labels: addedTags }, 'Auto-labeled image with Rekognition');
      } catch (rekError) {
        logger.warn({ err: rekError }, 'Failed to auto-label with Rekognition, continuing with manual tags');
      }
    }

    // Add manual tags
    if (tags && Array.isArray(tags)) {
      addedTags = [...addedTags, ...tags];
    }

    if (addedTags.length > 0) {
      await fragment.addTags(addedTags);
    }

    res.status(200).json(
      createSuccessResponse({
        id: fragment.id,
        tags: fragment.tags,
        addedTags,
      })
    );
  } catch (err) {
    logger.error({ err, id }, 'Error adding tags to fragment');
    if (err.message.includes('not found')) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};

/**
 * DELETE /v1/fragments/:id/tags
 * Remove tags from a fragment
 * Body: { tags: ["tag1", "tag2"] }
 */
const removeTags = async (req, res) => {
  const { id } = req.params;
  const { tags } = req.body || {};

  try {
    const fragment = await Fragment.byId(req.user, id);

    if (tags && Array.isArray(tags)) {
      await fragment.removeTags(tags);
    }

    res.status(200).json(
      createSuccessResponse({
        id: fragment.id,
        tags: fragment.tags,
        removedTags: tags || [],
      })
    );
  } catch (err) {
    logger.error({ err, id }, 'Error removing tags from fragment');
    if (err.message.includes('not found')) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};

module.exports = { getTags, addTags, removeTags };

