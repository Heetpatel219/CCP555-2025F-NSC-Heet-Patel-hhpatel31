// src/routes/index.js
const express = require('express');
const { version, author } = require('../../package.json');
const { authenticate } = require('../auth');

const router = express.Router();

// Public health check
router.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  if (process.env.LOG_LEVEL === 'debug') {
    req.log.info({ env: process.env }, 'Environment variables (debug)');
  }
  res.status(200).json({
    status: 'ok',
    author,
    githubUrl: 'https://github.com/Heetpatel219/fragment.git',
    version,
  });
});

// Secure API (all /v1/*)
router.use('/v1', authenticate(), require('./api'));

module.exports = router;
