const Fragment = require('../../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../../response');

/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  try {
    // Get all fragments for the authenticated user
    const fragments = await Fragment.byUser(req.user);

    // Return just the fragment IDs for security/privacy
    const fragmentIds = fragments.map(fragment => fragment.id);

    res.status(200).json(createSuccessResponse({
      fragments: fragmentIds,
    }));
  } catch (error) {
    const logger = require('../../../logger');
    logger.error({ error }, 'Error retrieving fragments');
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};
