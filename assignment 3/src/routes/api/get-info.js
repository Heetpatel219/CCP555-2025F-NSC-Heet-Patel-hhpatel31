const Fragment = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

/**
 * GET /v1/fragments/:id/info
 * Get fragment metadata only
 */
module.exports = async (req, res) => {
  const { id } = req.params;

  try {
    const fragment = await Fragment.byId(req.user, id);

    logger.debug({ id }, 'Returning fragment info');

    res.status(200).json(
      createSuccessResponse({
        fragment: {
          id: fragment.id,
          ownerId: fragment.ownerId,
          created: fragment.created,
          updated: fragment.updated,
          type: fragment.type,
          size: fragment.size,
          formats: fragment.formats,
        },
      })
    );
  } catch (err) {
    logger.error({ err, id }, 'Error retrieving fragment info');
    if (err.message.includes('not found')) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};

