const Fragment = require('../../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../../response');
const logger = require('../../../logger');

/**
 * Get a list of fragments for the current user
 * Supports expand=1 query parameter to return full fragment metadata
 */
module.exports = async (req, res) => {
  const expand = req.query.expand === '1' || req.query.expand === 'true';
  
  logger.debug({ 
    user: req.user, 
    expand 
  }, 'GET /v1/fragments request received');

  try {
    logger.info({ user: req.user, expand }, 'Retrieving fragments for user');

    // Get all fragments for the authenticated user
    const fragments = await Fragment.byUser(req.user);

    logger.debug({ 
      user: req.user, 
      fragmentCount: fragments.length 
    }, 'Fragments retrieved from database');

    // If expand=1, return full fragment metadata, otherwise just IDs
    let responseData;
    if (expand) {
      responseData = fragments.map(fragment => ({
        id: fragment.id,
        ownerId: fragment.ownerId,
        created: fragment.created,
        updated: fragment.updated,
        type: fragment.type,
        size: fragment.size,
      }));
      logger.debug({ 
        user: req.user, 
        fragmentCount: responseData.length 
      }, 'Expanded fragment metadata prepared');
    } else {
      responseData = fragments.map(fragment => fragment.id);
      logger.debug({ 
        user: req.user, 
        fragmentCount: responseData.length 
      }, 'Fragment IDs prepared');
    }

    logger.info({ 
      user: req.user, 
      fragmentCount: responseData.length,
      expand 
    }, 'Fragment list prepared for response');

    res.status(200).json(createSuccessResponse({
      fragments: responseData,
    }));

    logger.info({ 
      user: req.user, 
      statusCode: 200,
      fragmentCount: responseData.length 
    }, 'Fragment list retrieval completed successfully');
  } catch (error) {
    logger.error({ error, user: req.user }, 'Error retrieving fragments');
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};
