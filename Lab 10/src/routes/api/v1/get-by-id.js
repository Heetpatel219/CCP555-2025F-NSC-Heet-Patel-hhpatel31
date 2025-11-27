const Fragment = require('../../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../../response');
const logger = require('../../../logger');

/**
 * Get a specific fragment by ID
 */
module.exports = async (req, res) => {
  logger.debug({ 
    fragmentId: req.params.id, 
    user: req.user 
  }, 'GET /v1/fragments/:id request received');

  try {
    const fragment = await Fragment.byId(req.params.id);

    if (!fragment) {
      logger.warn({ 
        fragmentId: req.params.id, 
        user: req.user 
      }, 'Fragment not found');
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    logger.debug({ 
      fragmentId: fragment.id, 
      ownerId: fragment.ownerId,
      user: req.user 
    }, 'Fragment found, checking ownership');

    // Check if the fragment belongs to the authenticated user
    if (fragment.ownerId !== req.user) {
      logger.warn({ 
        fragmentId: req.params.id, 
        ownerId: fragment.ownerId,
        user: req.user 
      }, 'Fragment access denied - ownership mismatch');
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    logger.info({ 
      fragmentId: fragment.id, 
      user: req.user 
    }, 'Retrieving fragment data');

    const data = await fragment.getData();

    logger.debug({ 
      fragmentId: fragment.id, 
      dataSize: data ? data.length : 0 
    }, 'Fragment data retrieved');

    // Return the fragment data with metadata
    res.status(200).json(createSuccessResponse({
      fragment: {
        id: fragment.id,
        ownerId: fragment.ownerId,
        created: fragment.created,
        updated: fragment.updated,
        type: fragment.type,
        size: fragment.size,
        data: data ? data.toString('utf8') : null,
      },
    }));

    logger.info({ 
      fragmentId: fragment.id, 
      statusCode: 200 
    }, 'Fragment retrieval completed successfully');
  } catch (error) {
    logger.error({ 
      error, 
      fragmentId: req.params.id, 
      user: req.user 
    }, 'Error retrieving fragment');
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};


