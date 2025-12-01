const express = require('express');
const { authenticate } = require('../../../auth');
const router = express.Router();

// Routes
// Order matters: more specific routes must come before less specific ones
router.get('/', authenticate(), require('./get'));
router.get('/:id/info', authenticate(), require('./get-info')); // Must come before :id
// Handle both :id and :id.ext - the handler will check for extension
router.get('/:id', authenticate(), require('./get-by-id-ext'));
router.post('/', authenticate(), require('./post'));

module.exports = router;
