const Fragment = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

/**
 * GET /v1/fragments/analytics
 * Get overall analytics for user's fragments
 */
const getAllAnalytics = async (req, res) => {
  try {
    const fragments = await Fragment.byUser(req.user, true);

    // Calculate analytics
    const totalFragments = fragments.length;
    const totalSize = fragments.reduce((sum, f) => sum + (f.size || 0), 0);
    const totalAccessCount = fragments.reduce((sum, f) => sum + (f.accessCount || 0), 0);

    // Type breakdown
    const typeBreakdown = {};
    fragments.forEach((f) => {
      const type = f.type?.split('/')[0] || 'unknown';
      typeBreakdown[type] = (typeBreakdown[type] || 0) + 1;
    });

    // Size breakdown
    const sizeBreakdown = {
      small: fragments.filter((f) => f.size < 1024).length, // < 1KB
      medium: fragments.filter((f) => f.size >= 1024 && f.size < 102400).length, // 1KB-100KB
      large: fragments.filter((f) => f.size >= 102400).length, // > 100KB
    };

    // Tag frequency
    const tagFrequency = {};
    fragments.forEach((f) => {
      (f.tags || []).forEach((tag) => {
        tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
      });
    });

    // Most accessed
    const mostAccessed = fragments
      .filter((f) => (f.accessCount || 0) > 0)
      .sort((a, b) => (b.accessCount || 0) - (a.accessCount || 0))
      .slice(0, 5)
      .map((f) => ({
        id: f.id,
        type: f.type,
        accessCount: f.accessCount,
      }));

    // Recently modified
    const recentlyModified = fragments
      .sort((a, b) => new Date(b.updated) - new Date(a.updated))
      .slice(0, 5)
      .map((f) => ({
        id: f.id,
        type: f.type,
        updated: f.updated,
      }));

    logger.debug({ totalFragments }, 'Analytics generated');

    res.status(200).json(
      createSuccessResponse({
        analytics: {
          summary: {
            totalFragments,
            totalSize,
            averageSize: totalFragments > 0 ? Math.round(totalSize / totalFragments) : 0,
            totalAccessCount,
            sharedCount: fragments.filter((f) => (f.sharedWith?.length || 0) > 0).length,
            versionedCount: fragments.filter((f) => (f.version || 1) > 1).length,
          },
          typeBreakdown,
          sizeBreakdown,
          tagFrequency,
          mostAccessed,
          recentlyModified,
        },
      })
    );
  } catch (err) {
    logger.error({ err }, 'Error generating analytics');
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};

/**
 * GET /v1/fragments/:id/analytics
 * Get analytics for a specific fragment
 */
const getFragmentAnalytics = async (req, res) => {
  const { id } = req.params;

  try {
    const fragment = await Fragment.byId(req.user, id);
    const analytics = fragment.getAnalytics();

    res.status(200).json(createSuccessResponse({ analytics }));
  } catch (err) {
    logger.error({ err, id }, 'Error getting fragment analytics');
    if (err.message.includes('not found')) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};

module.exports = { getAllAnalytics, getFragmentAnalytics };

