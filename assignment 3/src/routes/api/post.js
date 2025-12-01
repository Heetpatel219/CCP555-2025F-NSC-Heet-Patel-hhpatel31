const Fragment = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

/**
 * POST /v1/fragments
 * Create a new fragment
 */
module.exports = async (req, res) => {
  const contentType = req.get('Content-Type');

  // Check content type header
  if (!contentType) {
    return res.status(415).json(createErrorResponse(415, 'Missing Content-Type header'));
  }

  // Check if content type is supported
  if (!Fragment.isSupportedType(contentType)) {
    logger.warn({ contentType }, 'Unsupported media type');
    return res.status(415).json(createErrorResponse(415, 'Unsupported Media Type'));
  }

  // Check if we got a Buffer
  if (!Buffer.isBuffer(req.body)) {
    return res.status(400).json(createErrorResponse(400, 'Invalid body'));
  }

  try {
    // Create a new fragment
    const fragment = new Fragment({
      ownerId: req.user,
      type: contentType,
      size: req.body.length,
    });

    // Save metadata and data
    await fragment.save();
    await fragment.setData(req.body);

    // Build the Location header URL
    const apiUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    const location = `${apiUrl}/v1/fragments/${fragment.id}`;
    res.setHeader('Location', location);

    logger.info({ id: fragment.id, type: fragment.type, size: fragment.size }, 'Fragment created');

    res.status(201).json(
      createSuccessResponse({
        fragment: {
          id: fragment.id,
          ownerId: fragment.ownerId,
          created: fragment.created,
          updated: fragment.updated,
          type: fragment.type,
          size: fragment.size,
        },
      })
    );
  } catch (err) {
    logger.error({ err }, 'Error creating fragment');
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};
