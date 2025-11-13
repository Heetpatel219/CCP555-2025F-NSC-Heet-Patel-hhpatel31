const express = require('express');
const router = express.Router();

router.use('/fragments', require('./fragments'));

router.get('/', (req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.json({
    status: 'ok',
    author: 'Heet Patel',
    githubUrl: 'https://github.com/Heetpatel219/CCP555-2025F-NSC-Heet-Patel-hhpatel31/tree/main/Lab%201',
    version: '0.0.1'
  });
});

module.exports = router;
