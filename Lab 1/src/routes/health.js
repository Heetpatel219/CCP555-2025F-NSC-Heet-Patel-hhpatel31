const express = require('express');
const router = express.Router();
const os = require('os');
const { version } = require('../../package.json');

/**
 * Health check endpoint that provides comprehensive system information
 */
router.get('/', (req, res) => {
  try {
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: version,
      author: 'Heet Patel',
      githubUrl: 'https://github.com/Heetpatel219/CCP555-2025F-NSC-Heet-Patel-hhpatel31/tree/main/Lab%201',
      environment: process.env.NODE_ENV || 'development',
      system: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024),
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
        },
        cpu: {
          loadAverage: os.loadavg(),
          cpus: os.cpus().length
        }
      },
      services: {
        database: 'memory', // Since we're using in-memory storage
        authentication: 'active'
      }
    };

    // Set cache control to prevent caching of health check responses
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    res.status(200).json(healthData);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: {
        message: 'Health check failed',
        code: 500
      }
    });
  }
});

/**
 * Simple health check endpoint for basic monitoring
 */
router.get('/ping', (req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'pong'
  });
});

module.exports = router;

