const Fragment = require('../../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../../response');
const logger = require('../../../logger');

/**
 * Get a specific fragment by ID
 * Returns the fragment data with the expected Content-Type header
 */
module.exports = async (req, res) => {
  logger.debug({ 
    fragmentId: req.params.id, 
    user: req.user 
  }, 'GET /v1/fragments/:id request received');

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
    }, 'Retrieving fragment data');

    const data = await fragment.getData();

    logger.debug({ 
      fragmentId: fragment.id, 
      dataSize: data ? data.length : 0,
      contentType: fragment.type
    }, 'Fragment data retrieved');

    // Set the Content-Type header based on fragment type
    res.setHeader('Content-Type', fragment.type);
    
    // Return the fragment data (not JSON, but the raw data)
    res.status(200).send(data);

    logger.info({ 
      fragmentId: fragment.id, 
      statusCode: 200,
      contentType: fragment.type
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


