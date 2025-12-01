const Fragment = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

/**
 * GET /v1/fragments
 * Get a list of fragments for the current user
 * Query params:
 *   - expand=1 to include full metadata for each fragment
 */
module.exports = async (req, res) => {
  try {
    const expand = req.query.expand === '1';
    const fragments = await Fragment.byUser(req.user, expand);

    logger.debug({ user: req.user, expand, count: fragments.length }, 'Listed fragments');

    res.status(200).json(
      createSuccessResponse({
        fragments: expand
          ? fragments.map((f) => ({
              id: f.id,
              ownerId: f.ownerId,
              created: f.created,
              updated: f.updated,
              type: f.type,
              size: f.size,
            }))
          : fragments,
      })
    );
  } catch (err) {
    logger.error({ err }, 'Error retrieving fragments');
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};
