require('dotenv').config();

console.log("ENV TEST:", process.env.AUTH_KEY, process.env.AUTH_SECRET);


const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const passport = require('passport');
const pinoHttp = require('pino-http');

const logger = require('./logger');
const auth = require('./auth');
const { createSuccessResponse, createErrorResponse } = require('./response');
const { author, version } = require('../package.json');

const app = express();

// Middleware
app.use(pinoHttp({ logger }));
app.use(helmet());
app.use(cors());
app.use(compression());

passport.use(auth.strategy());
app.use(passport.initialize());

// Health endpoint
app.get('/', (req, res) => {
  res.set('Cache-Control', 'no-cache'); // <-- add this line
  res.json(
    createSuccessResponse({
      author,
      version,
      githubUrl: 'http://localhost:8080/CCP555-2025F-NSC-Heet-Patel-hhpatel31',
    })
  );
});


// Mount routes
app.use('/', require('./routes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json(createErrorResponse(404, 'not found'));
});

// Error handler
app.use((err, req, res, _next) => { // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  const message = err.message || 'unable to process request';
  if (status > 499) logger.error({ err }, 'Error processing request');
  res.status(status).json(createErrorResponse(status, message));
});

module.exports = app;
