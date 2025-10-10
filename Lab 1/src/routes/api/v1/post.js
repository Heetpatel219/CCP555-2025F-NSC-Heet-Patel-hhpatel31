const Fragment = require('../../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../../response');
const logger = require('../../../logger');

/**
 * Create a new fragment
 */
module.exports = async (req, res) => {
  logger.debug({ 
    user: req.user, 
    contentType: req.get('Content-Type'),
    bodySize: req.body ? req.body.length : 0 
  }, 'POST /v1/fragments request received');

  // Check if we got a Buffer from the raw body parser (supported content type)
  if (Buffer.isBuffer(req.body)) {
    // Content type was supported, proceed with fragment creation
    try {
      logger.info({ 
        user: req.user, 
        contentType: req.get('Content-Type'),
        bodySize: req.body.length 
      }, 'Creating new fragment');

      // Create a new fragment
      const fragment = new Fragment({
        ownerId: req.user,
        type: req.get('Content-Type'),
        size: req.body.length,
      });

      logger.debug({ 
        fragmentId: fragment.id, 
        ownerId: fragment.ownerId,
        type: fragment.type,
        size: fragment.size 
      }, 'Fragment metadata created');

      // Set the fragment data
      await fragment.setData(req.body);

      // Save the fragment metadata
      await fragment.save();

      logger.info({ 
        fragmentId: fragment.id, 
        ownerId: fragment.ownerId 
      }, 'Fragment saved successfully');

      // Return success response with Location header
      // Use API_URL environment variable if available, otherwise use req.headers.host
      const apiUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
      const location = `${apiUrl}/v1/fragments/${fragment.id}`;
      res.setHeader('Location', location);

      logger.debug({ location }, 'Location header set');

      res.status(201).json(createSuccessResponse({
        fragment: {
          id: fragment.id,
          ownerId: fragment.ownerId,
          created: fragment.created,
          updated: fragment.updated,
          type: fragment.type,
          size: fragment.size,
        },
      }));

      logger.info({ 
        fragmentId: fragment.id, 
        statusCode: 201 
      }, 'Fragment creation completed successfully');
    } catch (error) {
      logger.error({ error, user: req.user }, 'Error creating fragment');
      res.status(500).json(createErrorResponse(500, 'Internal server error'));
    }
  } else {
    // Body was not parsed as Buffer, check if content type is supported
    const contentType = req.get('Content-Type');
    logger.debug({ contentType }, 'Checking content type support');
    
    if (!contentType) {
      logger.warn({ user: req.user }, 'Missing Content-Type header');
      return res.status(415).json(createErrorResponse(415, 'Missing Content-Type header'));
    }

    if (!Fragment.isSupportedType(contentType)) {
      logger.warn({ 
        contentType, 
        user: req.user 
      }, 'Unsupported content type');
      return res.status(415).json(createErrorResponse(415, 'Unsupported content type'));
    }

    // Content type is supported but body is not a Buffer - this shouldn't happen
    logger.error({ 
      contentType, 
      user: req.user,
      bodyType: typeof req.body 
    }, 'Content type supported but body not parsed as Buffer');
    return res.status(400).json(createErrorResponse(400, 'Invalid request body'));
  }
};
