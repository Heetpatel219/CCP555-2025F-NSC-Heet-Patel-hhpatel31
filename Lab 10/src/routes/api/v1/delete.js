const Fragment = require('../../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../../response');
const logger = require('../../../logger');

/**
 * Delete a specific fragment by ID
 */
module.exports = async (req, res) => {
  logger.debug({ 
    fragmentId: req.params.id, 
    user: req.user 
  }, 'DELETE /v1/fragments/:id request received');

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
    }, 'Deleting fragment');

    // Delete the fragment
    const deleted = await fragment.delete();

    if (!deleted) {
      logger.warn({ 
        fragmentId: fragment.id, 
        user: req.user 
      }, 'Failed to delete fragment');
      return res.status(500).json(createErrorResponse(500, 'Failed to delete fragment'));
    }

    logger.info({ 
      fragmentId: fragment.id, 
      statusCode: 200,
      user: req.user 
    }, 'Fragment deleted successfully');

    // Return success response
    res.status(200).json(createSuccessResponse({
      status: 'ok',
    }));

  } catch (err) {
    logger.error({ err, fragmentId: req.params.id, user: req.user }, 'Error deleting fragment');
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};

