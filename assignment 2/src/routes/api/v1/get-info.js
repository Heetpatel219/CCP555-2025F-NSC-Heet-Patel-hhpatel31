const Fragment = require('../../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../../response');
const logger = require('../../../logger');

/**
 * Get fragment metadata by ID
 * Returns the fragment's metadata without the data
 */
module.exports = async (req, res) => {
  logger.debug({ 
    fragmentId: req.params.id, 
    user: req.user 
  }, 'GET /v1/fragments/:id/info request received');

  try {
    // Find fragment by owner and ID
    const fragment = await Fragment.find(req.user, req.params.id);

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
    }, 'Fragment found');

    logger.info({ 
      fragmentId: fragment.id, 
      user: req.user 
    }, 'Returning fragment metadata');

    // Return the fragment metadata
    res.status(200).json(createSuccessResponse({
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
      statusCode: 200 
    }, 'Fragment metadata retrieval completed successfully');
  } catch (error) {
    logger.error({ 
      error, 
      fragmentId: req.params.id, 
      user: req.user 
    }, 'Error retrieving fragment metadata');
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};

