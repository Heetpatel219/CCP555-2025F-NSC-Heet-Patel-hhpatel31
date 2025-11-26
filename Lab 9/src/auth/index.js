// src/auth/index.js

// Configure authentication strategies for Passport
const auth = require('http-auth');
const passport = require('passport');
const authPassport = require('http-auth-passport');
const logger = require('../logger');
const authorize = require('./auth-middleware');

// We expect HTPASSWD_FILE to be defined.
if (!process.env.HTPASSWD_FILE) {
  throw new Error('missing expected env var: HTPASSWD_FILE');
}

// Log that we're using both Basic Auth and JWT
logger.info('Using HTTP Basic Auth and JWT for auth');

module.exports.strategy = () =>
  // For our Passport authentication strategy, we'll look for a
  // username/password pair in the Authorization header.
  authPassport(
    auth.basic({
      file: process.env.HTPASSWD_FILE,
    })
  );

// Use authorize wrapper to return JSON errors instead of plain text
// Only use 'http' strategy (Basic Auth) since 'bearer' may not be available
module.exports.authenticate = () => authorize('http');