const Fragment = require('../../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../../response');
const logger = require('../../../logger');
const path = require('path');

/**
 * Get a fragment by ID
 * Handles both GET /fragments/:id (returns raw data) and GET /fragments/:id.ext (returns converted data)
 */
module.exports = async (req, res) => {
  // Extract the ID and extension from the route parameter
  // The route will be /fragments/:id or /fragments/:id.ext
  const fullParam = req.params.id;
  const ext = path.extname(fullParam);
  const id = ext ? path.basename(fullParam, ext) : fullParam;

  logger.debug({ 
    fragmentId: id,
    extension: ext || 'none',
    fullParam,
    user: req.user 
  }, 'GET /v1/fragments/:id request received');

  try {
    // Find fragment by owner and ID
    const fragment = await Fragment.find(req.user, id);

    if (!fragment) {
      logger.warn({ 
        fragmentId: id, 
        user: req.user 
      }, 'Fragment not found');
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    logger.debug({ 
      fragmentId: fragment.id, 
      ownerId: fragment.ownerId,
      extension: ext || 'none',
      user: req.user 
    }, 'Fragment found');

    // If there's an extension, try to convert
    if (ext) {
      logger.debug({ 
        fragmentId: fragment.id,
        fromType: fragment.type,
        toExt: ext,
        user: req.user 
      }, 'Extension detected, checking conversion support');

      // Check if conversion is supported
      if (!Fragment.canConvert(fragment.type, ext)) {
        logger.warn({ 
          fragmentId: fragment.id,
          fromType: fragment.type,
          toExt: ext,
          user: req.user 
        }, 'Conversion not supported');
        return res.status(415).json(createErrorResponse(
          415, 
          `Conversion from ${fragment.type} to ${ext} is not supported`
        ));
      }

      logger.info({ 
        fragmentId: fragment.id,
        fromType: fragment.type,
        toExt: ext,
        user: req.user 
      }, 'Converting fragment data');

      // Convert the fragment data
      const convertedData = await fragment.convertTo(ext);

      logger.debug({ 
        fragmentId: fragment.id, 
        dataSize: convertedData ? convertedData.length : 0,
        fromType: fragment.type,
        toExt: ext
      }, 'Fragment data converted');

      // Determine the Content-Type for the converted data
      const convertedType = Fragment.getMimeType(ext);
      if (convertedType) {
        res.setHeader('Content-Type', convertedType);
      }

      // Return the converted fragment data
      res.status(200).send(convertedData);

      logger.info({ 
        fragmentId: fragment.id, 
        statusCode: 200,
        fromType: fragment.type,
        toExt: ext,
        contentType: convertedType
      }, 'Fragment conversion completed successfully');
      return;
    }

    // No extension - return raw fragment data
    logger.info({ 
      fragmentId: fragment.id, 
      user: req.user 
    }, 'Retrieving fragment data (no conversion)');

    const data = await fragment.getData();

    logger.debug({ 
      fragmentId: fragment.id, 
      dataSize: data ? data.length : 0,
      contentType: fragment.type
    }, 'Fragment data retrieved');

    // Set the Content-Type header based on fragment type
    res.setHeader('Content-Type', fragment.type);
    
    // Return the fragment data (not JSON, but the raw data)
    res.status(200).send(data);

    logger.info({ 
      fragmentId: fragment.id, 
      statusCode: 200,
      contentType: fragment.type
    }, 'Fragment retrieval completed successfully');
  } catch (error) {
    logger.error({ 
      error, 
      fragmentId: id,
      extension: ext || 'none',
      user: req.user 
    }, 'Error retrieving/converting fragment');
    
    // If it's a known conversion error, return 415
    if (error.message && error.message.includes('not supported')) {
      return res.status(415).json(createErrorResponse(415, error.message));
    }
    
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};

