const express = require('express');
const router = express.Router();
const { version, author } = require('../../package.json');

/**
 * Health check endpoint
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    author: author,
    githubUrl: 'https://github.com/Heetpatel219/CCP555-2025F-NSC-Heet-Patel-hhpatel31',
    version: version,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
