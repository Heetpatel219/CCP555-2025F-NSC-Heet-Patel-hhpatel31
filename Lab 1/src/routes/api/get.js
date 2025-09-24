const express = require('express');
const { createSuccessResponse } = require('../../response');

const router = express.Router();

// GET /v1/fragments
router.get('/fragments', (req, res) => {
  // For testing, return fake fragments array
  const fragments = [
    { id: '1', ownerId: 'user1', data: 'fragment1' },
    { id: '2', ownerId: 'user1', data: 'fragment2' },
  ];

  res.json(createSuccessResponse({ fragments }));
});

module.exports = router;
