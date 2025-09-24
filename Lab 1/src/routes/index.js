// src/routes/index.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../auth'); // your auth middleware

/**
 * Protect all /v1 routes so you must be authenticated
 */
router.use('/v1', authenticate(), require('./api')); // mount API routes

module.exports = router;
