const express = require('express');
const { authenticate } = require('../../../auth');
const router = express.Router();

// Routes
router.get('/', authenticate(), require('./get'));
router.get('/:id', authenticate(), require('./get-by-id'));
router.post('/', authenticate(), require('./post'));
router.delete('/:id', authenticate(), require('./delete'));

module.exports = router;
