const Fragment = require('../../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../../response');

/**
 * Get a specific fragment by ID
 */
module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.params.id);

    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    // Check if the fragment belongs to the authenticated user
    if (fragment.ownerId !== req.user) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    const data = await fragment.getData();

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
  } catch (error) {
    const logger = require('../../../logger');
    logger.error({ error }, 'Error retrieving fragment');
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};


