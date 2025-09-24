// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const passport = require('passport');
const pinoHttp = require('pino-http');

const logger = require('./logger');       // your logger module
const auth = require('./auth');           // Passport strategy
const { author, version } = require('../package.json');

const app = express();

// Middleware
app.use(pinoHttp({ logger }));
app.use(helmet());
app.use(cors());
app.use(compression());

// Add 404 middleware to handle any requests for resources that can't be found can't be found
app.use((req, res) => {
  // Pass along an error object to the error-handling middleware
  res.status(404).json({
    status: 'error',
    error: {
      message: 'not found',
      code: 404,
    },
  });
});

// Set Cache-Control: no-cache for all responses
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-cache');
  next();
});

// Passport setup
passport.use(auth.strategy());
app.use(passport.initialize());

// Health endpoint for tests
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    author: author,
    version: version,
    githubUrl: 'http://localhost:8080/CCP555-2025F-NSC-Heet-Patel-hhpatel31',
  });
});

// Mount routes
app.use('/', require('./routes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    error: { message: 'not found', code: 404 },
  });
});

// Error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'unable to process request';
  if (status > 499) logger.error({ err }, 'Error processing request');
  res.status(status).json({ status: 'error', error: { message, code: status } });
});

module.exports = app;
