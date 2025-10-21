const express = require('express');
const router = express.Router();

// Health check
router.get('/', (req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.status(200).json({
    status: 'ok',
    author: 'Heet Patel',
    githubUrl: 'https://github.com/Heetpatel219/CCP555-2025F-NSC-Heet-Patel-hhpatel31/tree/main/Lab%201',
    version: '0.0.1'
  });
});

// API routes
router.use('/', require('./api'));

module.exports = router;