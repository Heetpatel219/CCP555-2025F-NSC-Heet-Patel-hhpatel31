// src/routes/api.js
const express = require('express');
const router = express.Router();
const { createSuccessResponse } = require('../response');

// Dummy fragments for testing
const dummyFragments = [
  { id: '1', owner: 'user1@email.com', content: 'fragment 1' },
  { id: '2', owner: 'user1@email.com', content: 'fragment 2' },
];

router.get('/fragments', (req, res) => {
  // Wrap fragments array in a success response
  res.json(createSuccessResponse({ fragments: dummyFragments }));
});

module.exports = router;
