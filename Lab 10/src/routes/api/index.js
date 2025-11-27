const express = require('express');
const router = express.Router();

// Fragment routes
router.use('/fragments', require('./fragments'));

module.exports = router;


