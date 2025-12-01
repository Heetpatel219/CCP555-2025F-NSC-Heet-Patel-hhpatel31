const passport = require('passport');
const { hash } = require('../hash');
const logger = require('../logger');

/**
 * Custom authorization middleware that hashes user emails for privacy
 * @param {string} strategy - The passport strategy to use ('http' or 'bearer')
 * @returns {Function} - Express middleware function
 */
function authorize(strategy) {
  return (req, res, next) => {
    passport.authenticate(strategy, { session: false }, (err, user, info) => {
      if (err) {
        logger.error({ err }, 'Authentication error');
        return res.status(500).json({
          status: 'error',
          error: {
            code: 500,
            message: 'Internal server error'
          }
        });
      }

      if (!user) {
        logger.warn({ info }, 'Authentication failed');
        return res.status(401).json({
          status: 'error',
          error: {
            code: 401,
            message: 'Unauthorized'
          }
        });
      }

      // Hash the user email for privacy
      const hashedEmail = hash(user.email || user.username || user);
      req.user = hashedEmail;
      
      logger.debug({ 
        originalUser: user.email || user.username || user,
        hashedUser: hashedEmail 
      }, 'User authenticated and email hashed');

      next();
    })(req, res, next);
  };
}

module.exports = authorize;

