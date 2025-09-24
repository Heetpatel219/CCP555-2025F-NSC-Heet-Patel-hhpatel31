const express = require('express');
const { authenticate } = require('../auth');

const router = express.Router();

// Mount API routes under /v1 and protect them
router.use('/v1', authenticate(), require('./api'));

// Export router for app.js
module.exports = router;
