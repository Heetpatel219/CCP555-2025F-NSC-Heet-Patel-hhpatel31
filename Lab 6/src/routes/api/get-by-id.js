const Fragment = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

/**
 * Get a specific fragment by ID
 */
module.exports = async (req, res) => {
  try {
    const data = await Fragment.find(req.user, req.params.id);
    
    if (!data) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    // Return the fragment data
    res.status(200).json(createSuccessResponse({
      fragment: {
        id: req.params.id,
        ownerId: req.user,
        data: data,
      },
    }));
  } catch (error) {
    console.error('Error retrieving fragment:', error);
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};

