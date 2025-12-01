const path = require('path');
const Fragment = require('../../model/fragment');
const { createErrorResponse } = require('../../response');
const logger = require('../../logger');

/**
 * GET /v1/fragments/:id
 * GET /v1/fragments/:id.ext
 * Get fragment data, optionally converting to different format via extension
 */
module.exports = async (req, res) => {
  let { id } = req.params;
  let ext = null;

  // Check if id has an extension
  const parsedPath = path.parse(id);
  if (parsedPath.ext) {
    id = parsedPath.name;
    ext = parsedPath.ext;
  }

  try {
    const fragment = await Fragment.byId(req.user, id);

    // Increment access count
    await fragment.incrementAccessCount();

    // If no extension, return raw data
    if (!ext) {
      const data = await fragment.getData();
      res.setHeader('Content-Type', fragment.type);
      res.setHeader('Content-Length', data.length);
      logger.debug({ id, type: fragment.type, size: data.length }, 'Returning fragment data');
      return res.status(200).send(data);
    }

    // Try to convert to requested format
    if (!fragment.canConvertTo(ext)) {
      logger.warn({ id, ext, type: fragment.type }, 'Unsupported conversion');
      return res.status(415).json(createErrorResponse(415, `Cannot convert ${fragment.type} to ${ext}`));
    }

    const { data, mimeType } = await fragment.convertTo(ext);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', data.length);
    logger.debug({ id, from: fragment.type, to: mimeType }, 'Converted and returning fragment');
    return res.status(200).send(data);
  } catch (err) {
    logger.error({ err, id }, 'Error retrieving fragment');
    if (err.message.includes('not found')) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};
