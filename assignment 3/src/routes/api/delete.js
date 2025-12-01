const Fragment = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

/**
 * DELETE /v1/fragments/:id
 * Delete an existing fragment
 */
module.exports = async (req, res) => {
  const { id } = req.params;

  try {
    // Get the fragment to verify it exists and belongs to this user
    const fragment = await Fragment.byId(req.user, id);

    // Delete the fragment
    await fragment.delete();

    logger.info({ id }, 'Fragment deleted');

    res.status(200).json(createSuccessResponse());
  } catch (err) {
    logger.error({ err, id }, 'Error deleting fragment');
    if (err.message.includes('not found')) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};

