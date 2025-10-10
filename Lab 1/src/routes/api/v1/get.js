const Fragment = require('../../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../../response');
const logger = require('../../../logger');

/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  logger.debug({ user: req.user }, 'GET /v1/fragments request received');

  try {
    logger.info({ user: req.user }, 'Retrieving fragments for user');

    // Get all fragments for the authenticated user
    const fragments = await Fragment.byUser(req.user);

    logger.debug({ 
      user: req.user, 
      fragmentCount: fragments.length 
    }, 'Fragments retrieved from database');

    // Return just the fragment IDs for security/privacy
    const fragmentIds = fragments.map(fragment => fragment.id);

    logger.info({ 
      user: req.user, 
      fragmentCount: fragmentIds.length 
    }, 'Fragment list prepared for response');

    res.status(200).json(createSuccessResponse({
      fragments: fragmentIds,
    }));

    logger.info({ 
      user: req.user, 
      statusCode: 200,
      fragmentCount: fragmentIds.length 
    }, 'Fragment list retrieval completed successfully');
  } catch (error) {
    logger.error({ error, user: req.user }, 'Error retrieving fragments');
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};
