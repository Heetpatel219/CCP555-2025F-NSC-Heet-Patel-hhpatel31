const Fragment = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

/**
 * PUT /v1/fragments/:id
 * Update an existing fragment's data (but not its type)
 */
module.exports = async (req, res) => {
  const { id } = req.params;

  try {
    // Get the existing fragment
    const fragment = await Fragment.byId(req.user, id);

    // Check if content type matches (cannot change type)
    const contentType = req.get('Content-Type');
    const baseType = contentType ? contentType.split(';')[0].trim() : null;
    const fragmentBaseType = fragment.type.split(';')[0].trim();

    if (baseType !== fragmentBaseType) {
      logger.warn(
        { contentType, fragmentType: fragment.type },
        'Cannot change fragment type on update'
      );
      return res.status(400).json(createErrorResponse(400, 'Cannot change fragment type'));
    }

    // Update the fragment data
    await fragment.setData(req.body);

    logger.info({ id: fragment.id, size: fragment.size }, 'Fragment updated');

    res.status(200).json(
      createSuccessResponse({
        fragment: {
          id: fragment.id,
          ownerId: fragment.ownerId,
          created: fragment.created,
          updated: fragment.updated,
          type: fragment.type,
          size: fragment.size,
        },
      })
    );
  } catch (err) {
    logger.error({ err, id }, 'Error updating fragment');
    if (err.message.includes('not found')) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};

