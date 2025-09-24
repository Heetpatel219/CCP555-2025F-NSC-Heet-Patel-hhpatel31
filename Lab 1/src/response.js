// src/response.js

/**
 * A successful response looks like:
 * { "status": "ok", ... }
 */
function createSuccessResponse(data) {
  return {
    status: 'ok',
    ...data,
  };
}

/**
 * An error response looks like:
 * {
 *   status: 'error',
 *   error: { code, message }
 * }
 */
function createErrorResponse(code, message) {
  return {
    status: 'error',
    error: { code, message },
  };
}

module.exports = { createErrorResponse, createSuccessResponse };
