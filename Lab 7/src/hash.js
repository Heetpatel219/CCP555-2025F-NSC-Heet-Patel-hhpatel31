const crypto = require('crypto');

/**
 * Hash a string using SHA-256
 * @param {string} str - The string to hash
 * @returns {string} - The hashed string
 */
function hash(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

module.exports = { hash };

