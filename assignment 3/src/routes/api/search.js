const Fragment = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

/**
 * GET /v1/fragments/search
 * Search fragments by various criteria
 * Query params:
 *   - type: filter by content type (partial match)
 *   - minSize: minimum size in bytes
 *   - maxSize: maximum size in bytes
 *   - tags: comma-separated tags
 *   - fromDate: filter by created date (ISO string)
 *   - toDate: filter by created date (ISO string)
 */
module.exports = async (req, res) => {
  try {
    const { type, minSize, maxSize, tags, fromDate, toDate } = req.query;

    // Get all fragments with metadata
    let fragments = await Fragment.byUser(req.user, true);

    // Apply filters
    if (type) {
      fragments = fragments.filter((f) => f.type && f.type.includes(type));
    }

    if (minSize) {
      const min = parseInt(minSize, 10);
      if (!isNaN(min)) {
        fragments = fragments.filter((f) => f.size >= min);
      }
    }

    if (maxSize) {
      const max = parseInt(maxSize, 10);
      if (!isNaN(max)) {
        fragments = fragments.filter((f) => f.size <= max);
      }
    }

    if (tags) {
      const tagList = tags.split(',').map((t) => t.trim().toLowerCase());
      fragments = fragments.filter((f) => {
        const fragmentTags = (f.tags || []).map((t) => t.toLowerCase());
        return tagList.some((tag) => fragmentTags.includes(tag));
      });
    }

    if (fromDate) {
      const from = new Date(fromDate);
      if (!isNaN(from.getTime())) {
        fragments = fragments.filter((f) => new Date(f.created) >= from);
      }
    }

    if (toDate) {
      const to = new Date(toDate);
      if (!isNaN(to.getTime())) {
        fragments = fragments.filter((f) => new Date(f.created) <= to);
      }
    }

    logger.debug({ count: fragments.length, query: req.query }, 'Search completed');

    res.status(200).json(
      createSuccessResponse({
        query: { type, minSize, maxSize, tags, fromDate, toDate },
        count: fragments.length,
        fragments: fragments.map((f) => ({
          id: f.id,
          type: f.type,
          size: f.size,
          created: f.created,
          updated: f.updated,
          tags: f.tags || [],
          version: f.version || 1,
        })),
      })
    );
  } catch (err) {
    logger.error({ err }, 'Error searching fragments');
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};

