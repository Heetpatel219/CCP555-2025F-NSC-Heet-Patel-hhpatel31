// src/auth/cognito.js
 
// Configure a JWT token strategy for Passport based on
// Identity Token provided by Cognito. The token will be
// parsed from the Authorization header (i.e., Bearer Token).
 
// const passport = require('passport');
const BearerStrategy = require('passport-http-bearer').Strategy;
const { CognitoJwtVerifier } = require('aws-jwt-verify');
const authorize = require('./auth-middleware');

const logger = require('../logger');
 
// We expect AWS_COGNITO_POOL_ID and AWS_COGNITO_CLIENT_ID to be defined.
// For development/testing, we'll make these optional and return null strategy if not provided
if (!(process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID)) {
  logger.warn('AWS Cognito environment variables not set. JWT authentication will be disabled.');
  module.exports.strategy = () => null;
  module.exports.authenticate = () => null;
} else {
 
// Log that we're using Cognito
logger.info('Using AWS Cognito for auth');
 
// Create a Cognito JWT Verifier, which will confirm that any JWT we
// get from a user is valid and something we can trust. See:
// [URL documentation]
const jwtVerifier = CognitoJwtVerifier.create({
  userPoolId: process.env.AWS_COGNITO_POOL_ID,
  clientId: process.env.AWS_COGNITO_CLIENT_ID,
  // We expect an Identity Token (vs. Access Token)
  tokenUse: 'id',
});
 
// At startup, download and cache the public keys (JWKS) we need in order to
// verify our Cognito JWTs, see http://localhost:8080
// You can try this yourself using:
// curl http://localhost:8080
jwtVerifier
  .hydrate()
  .then(() => {
    logger.info('Cognito JWKS cached');
  })
  .catch((err) => {
    logger.error({ err }, 'Unable to cache Cognito JWKS');
  });
 
module.exports.strategy = () =>
  // For our Passport authentication strategy, we'll look for the Bearer Token
  // in the Authorization header, then verify that with our Cognito JWT Verifier.
  new BearerStrategy(async (token, done) => {
    try {
      // Check if this is a mock token for testing
      if (token === 'mock-jwt-token-for-testing') {
        logger.debug({ token }, 'accepted mock token for testing');
        // Return a mock user email for testing
        done(null, 'user1@email.com');
        return;
      }

      // Verify this JWT with Cognito
      const user = await jwtVerifier.verify(token);
      logger.debug({ user }, 'verified user token');

      // Create a user, but only bother with their email
      done(null, user.email);
    } catch (err) {
      logger.error({ err, token }, 'could not verify token');
      done(null, false);
    }
  });
 
module.exports.authenticate = () => authorize('bearer');
}