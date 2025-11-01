const Fragment = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

/**
 * Create a new fragment
 */
module.exports = async (req, res) => {
  // Check if we got a Buffer from the raw body parser (supported content type)
  if (Buffer.isBuffer(req.body)) {
    // Content type was supported, proceed with fragment creation
    try {
      // Create a new fragment
      const fragment = new Fragment({
        ownerId: req.user,
        type: req.get('Content-Type'),
        size: req.body.length,
      });

      // Save the fragment with data
      await fragment.save(req.body);

      // Return success response with Location header
      const location = `${req.protocol}://${req.get('host')}/v1/fragments/${fragment.id}`;
      res.setHeader('Location', location);

      res.status(201).json(createSuccessResponse({
        fragment: {
          id: fragment.id,
          ownerId: fragment.ownerId,
          created: fragment.created,
          type: fragment.type,
          size: fragment.size,
        },
      }));
    } catch (error) {
      console.error('Error creating fragment:', error);
      res.status(500).json(createErrorResponse(500, 'Internal server error'));
    }
  } else {
    // Body was not parsed as Buffer, check if content type is supported
    const contentType = req.get('Content-Type');
    if (!contentType) {
      return res.status(415).json(createErrorResponse(415, 'Missing Content-Type header'));
    }

    if (!Fragment.isSupportedType(contentType)) {
      return res.status(415).json(createErrorResponse(415, 'Unsupported Media Type'));
    }

    // Content type is supported but body is not a Buffer - this shouldn't happen
    return res.status(400).json(createErrorResponse(400, 'Invalid body'));
  }
};

