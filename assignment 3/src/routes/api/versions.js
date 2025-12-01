const Fragment = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

/**
 * GET /v1/fragments/:id/versions
 * Get version history for a fragment
 */
const getVersions = async (req, res) => {
  const { id } = req.params;

  try {
    const fragment = await Fragment.byId(req.user, id);

    // For now, return current version info
    // In a full implementation, you would store version history in a separate table
    const versions = [
      {
        version: fragment.version || 1,
        size: fragment.size,
        updated: fragment.updated,
        current: true,
      },
    ];

    res.status(200).json(
      createSuccessResponse({
        id: fragment.id,
        currentVersion: fragment.version || 1,
        versions,
      })
    );
  } catch (err) {
    logger.error({ err, id }, 'Error getting fragment versions');
    if (err.message.includes('not found')) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};

/**
 * GET /v1/fragments/:id/versions/:version
 * Get a specific version of a fragment
 */
const getVersion = async (req, res) => {
  const { id, version } = req.params;

  try {
    const fragment = await Fragment.byId(req.user, id);
    const requestedVersion = parseInt(version, 10);

    // For now, only support current version
    if (requestedVersion !== (fragment.version || 1)) {
      return res.status(404).json(createErrorResponse(404, 'Version not found'));
    }

    const data = await fragment.getData();
    res.setHeader('Content-Type', fragment.type);
    res.setHeader('X-Fragment-Version', fragment.version || 1);
    res.status(200).send(data);
  } catch (err) {
    logger.error({ err, id, version }, 'Error getting fragment version');
    if (err.message.includes('not found')) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};

module.exports = { getVersions, getVersion };

