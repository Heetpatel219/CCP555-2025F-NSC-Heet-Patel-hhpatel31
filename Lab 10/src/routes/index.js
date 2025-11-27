const express = require('express');
const router = express.Router();
const { version } = require('../../package.json');

// Health check routes
router.use('/health', require('./health'));

// Root health check (simple version)
router.get('/', (req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.status(200).json({
    status: 'ok',
    author: 'Heet Patel',
    githubUrl: 'https://github.com/Heetpatel219/CCP555-2025F-NSC-Heet-Patel-hhpatel31/tree/main/Lab%207',
    version: version
  });
});

// API routes
router.use('/', require('./api'));

module.exports = router;