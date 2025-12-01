const Fragment = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');
const crypto = require('crypto');

// Helper to hash email for privacy
const hashEmail = (email) => {
  return crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
};

/**
 * GET /v1/fragments/:id/share
 * Get sharing info for a fragment
 */
const getShareInfo = async (req, res) => {
  const { id } = req.params;

  try {
    const fragment = await Fragment.byId(req.user, id);

    res.status(200).json(
      createSuccessResponse({
        id: fragment.id,
        sharedWith: fragment.sharedWith || [],
        isShared: (fragment.sharedWith?.length || 0) > 0,
      })
    );
  } catch (err) {
    logger.error({ err, id }, 'Error getting share info');
    if (err.message.includes('not found')) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};

/**
 * POST /v1/fragments/:id/share
 * Share a fragment with another user
 * Body: { email: "user@example.com" }
 */
const shareFragment = async (req, res) => {
  const { id } = req.params;
  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json(createErrorResponse(400, 'Email is required'));
  }

  try {
    const fragment = await Fragment.byId(req.user, id);
    const shareWithId = hashEmail(email);

    await fragment.shareWith(shareWithId);

    logger.info({ id, email: email.substring(0, 3) + '***' }, 'Fragment shared');

    res.status(200).json(
      createSuccessResponse({
        id: fragment.id,
        sharedWith: fragment.sharedWith,
        message: `Fragment shared with ${email}`,
      })
    );
  } catch (err) {
    logger.error({ err, id }, 'Error sharing fragment');
    if (err.message.includes('not found')) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};

/**
 * DELETE /v1/fragments/:id/share
 * Remove sharing from a fragment
 * Body: { email: "user@example.com" }
 */
const unshareFragment = async (req, res) => {
  const { id } = req.params;
  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json(createErrorResponse(400, 'Email is required'));
  }

  try {
    const fragment = await Fragment.byId(req.user, id);
    const shareWithId = hashEmail(email);

    await fragment.unshareFrom(shareWithId);

    logger.info({ id, email: email.substring(0, 3) + '***' }, 'Fragment unshared');

    res.status(200).json(
      createSuccessResponse({
        id: fragment.id,
        sharedWith: fragment.sharedWith,
        message: `Sharing removed from ${email}`,
      })
    );
  } catch (err) {
    logger.error({ err, id }, 'Error unsharing fragment');
    if (err.message.includes('not found')) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};

/**
 * GET /v1/fragments/shared
 * Get fragments shared with the current user
 */
const getSharedFragments = async (req, res) => {
  try {
    // Note: In a production environment, this would require a GSI on the sharedWith field
    // For now, return empty array as a placeholder
    res.status(200).json(
      createSuccessResponse({
        fragments: [],
        message: 'Shared fragments feature - requires GSI for production',
      })
    );
  } catch (err) {
    logger.error({ err }, 'Error getting shared fragments');
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};

module.exports = { getShareInfo, shareFragment, unshareFragment, getSharedFragments };

