// src/routes/api.js
const express = require('express');
const router = express.Router();

// Use the real fragments API
router.use('/v1', require('./api/v1'));

module.exports = router;
