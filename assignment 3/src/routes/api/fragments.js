const express = require('express');
const { authenticate } = require('../../auth/basic-auth');
const Fragment = require('../../model/fragment');

const router = express.Router();

// Raw body parser for supported fragment types
const rawBody = () => {
  return express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      const contentType = req.get('Content-Type');
      return Fragment.isSupportedType(contentType);
    },
  });
};

// JSON body parser for bonus feature routes
const jsonBody = express.json();

// Import bonus feature handlers
const { getTags, addTags, removeTags } = require('./tags');
const { getVersions, getVersion } = require('./versions');
const { getShareInfo, shareFragment, unshareFragment, getSharedFragments } = require('./share');
const { getAllAnalytics, getFragmentAnalytics } = require('./analytics');
const { extractText, detectLabels } = require('./textract');

// Apply authentication to all routes
router.use(authenticate());

// ============================================
// STATIC ROUTES MUST COME BEFORE :id ROUTES
// ============================================

// Search (Bonus Feature)
router.get('/search', require('./search'));

// Analytics (Bonus Feature)
router.get('/analytics', getAllAnalytics);

// Shared fragments (Bonus Feature)
router.get('/shared', getSharedFragments);

// ============================================
// CORE FRAGMENT ROUTES
// ============================================

// GET /v1/fragments - List user's fragments
router.get('/', require('./get'));

// POST /v1/fragments - Create a new fragment
router.post('/', rawBody(), require('./post'));

// ============================================
// PARAMETERIZED ROUTES (:id)
// ============================================

// GET /v1/fragments/:id/info - Get fragment metadata
router.get('/:id/info', require('./get-info'));

// GET /v1/fragments/:id/tags - Get fragment tags (Bonus Feature)
router.get('/:id/tags', getTags);

// POST /v1/fragments/:id/tags - Add tags (Bonus Feature)
router.post('/:id/tags', jsonBody, addTags);

// DELETE /v1/fragments/:id/tags - Remove tags (Bonus Feature)
router.delete('/:id/tags', jsonBody, removeTags);

// GET /v1/fragments/:id/versions - Get version history (Bonus Feature)
router.get('/:id/versions', getVersions);

// GET /v1/fragments/:id/versions/:version - Get specific version (Bonus Feature)
router.get('/:id/versions/:version', getVersion);

// GET /v1/fragments/:id/share - Get share info (Bonus Feature)
router.get('/:id/share', getShareInfo);

// POST /v1/fragments/:id/share - Share fragment (Bonus Feature)
router.post('/:id/share', jsonBody, shareFragment);

// DELETE /v1/fragments/:id/share - Unshare fragment (Bonus Feature)
router.delete('/:id/share', jsonBody, unshareFragment);

// GET /v1/fragments/:id/analytics - Get fragment analytics (Bonus Feature)
router.get('/:id/analytics', getFragmentAnalytics);

// POST /v1/fragments/:id/extract-text - Extract text from image (Bonus Feature)
router.post('/:id/extract-text', jsonBody, extractText);

// POST /v1/fragments/:id/detect-labels - Detect labels in image (Bonus Feature)
router.post('/:id/detect-labels', jsonBody, detectLabels);

// PUT /v1/fragments/:id - Update fragment data
router.put('/:id', rawBody(), require('./put'));

// DELETE /v1/fragments/:id - Delete fragment
router.delete('/:id', require('./delete'));

// GET /v1/fragments/:id or /v1/fragments/:id.ext - Get fragment data (with optional conversion)
// This MUST be last to catch all :id patterns including .ext
router.get('/:id', require('./get-by-id'));

module.exports = router;
