const request = require('supertest');
const express = require('express');
const contentType = require('content-type');
const Fragment = require('../../src/model/fragment');

// Create a test app with mocked auth and raw body parser
const testApp = express();

// Mock authentication middleware - set user before routes
testApp.use((req, res, next) => {
  req.user = 'user1@email.com';
  next();
});

// Raw body parser for fragments (matching app.js)
const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      try {
        const { type } = contentType.parse(req);
        return Fragment.isSupportedType(type);
      } catch {
        return false;
      }
    },
  });

testApp.use('/v1/fragments', rawBody());

// Set up routes directly, bypassing authenticate middleware
const getFragments = require('../../src/routes/api/v1/get');
const postFragment = require('../../src/routes/api/v1/post');
const getFragmentById = require('../../src/routes/api/v1/get-by-id-ext');
const getFragmentInfo = require('../../src/routes/api/v1/get-info');

testApp.get('/v1/fragments', getFragments);
testApp.post('/v1/fragments', postFragment);
testApp.get('/v1/fragments/:id/info', getFragmentInfo);
testApp.get('/v1/fragments/:id', getFragmentById);

describe('Fragments v1 API routes', () => {
  const textData = 'Hello World';
  const jsonData = { message: 'Hello', count: 42 };
  const markdownData = '# Title\n\nThis is **bold** text.';

  beforeEach(() => {
    // Clear any existing fragments by resetting the database
    const db = require('../../src/model/data');
    db.db.db.clear();
  });

  describe('GET /v1/fragments', () => {
    test('should return an array of fragment IDs', async () => {
      const res = await request(testApp).get('/v1/fragments');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(Array.isArray(res.body.fragments)).toBe(true);
    });

    test('should return expanded fragment metadata when expand=1', async () => {
      // First create a fragment
      const postRes = await request(testApp)
        .post('/v1/fragments')
        .set('Content-Type', 'text/plain')
        .send(textData);

      const fragmentId = postRes.body.fragment.id;

      // Now get fragments with expand=1
      const res = await request(testApp).get('/v1/fragments?expand=1');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(Array.isArray(res.body.fragments)).toBe(true);
      expect(res.body.fragments.length).toBeGreaterThan(0);
      expect(res.body.fragments[0]).toHaveProperty('id');
      expect(res.body.fragments[0]).toHaveProperty('type');
      expect(res.body.fragments[0]).toHaveProperty('size');
      expect(res.body.fragments[0].id).toBe(fragmentId);
    });

    test('should return fragment IDs when expand is not set', async () => {
      // First create a fragment
      await request(testApp)
        .post('/v1/fragments')
        .set('Content-Type', 'text/plain')
        .send(textData);

      // Now get fragments without expand
      const res = await request(testApp).get('/v1/fragments');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(Array.isArray(res.body.fragments)).toBe(true);
      expect(res.body.fragments.length).toBeGreaterThan(0);
      expect(typeof res.body.fragments[0]).toBe('string');
    });
  });

  describe('POST /v1/fragments', () => {
    test('should create a plain text fragment', async () => {
      const res = await request(testApp)
        .post('/v1/fragments')
        .set('Content-Type', 'text/plain')
        .send(textData);

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('ok');
      expect(res.body.fragment).toHaveProperty('id');
      expect(res.body.fragment.type).toBe('text/plain');
      expect(res.body.fragment.size).toBe(textData.length);
      expect(res.headers.location).toBeDefined();
    });

    test('should create a JSON fragment', async () => {
      const jsonString = JSON.stringify(jsonData);
      const res = await request(testApp)
        .post('/v1/fragments')
        .set('Content-Type', 'application/json')
        .send(jsonString);

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('ok');
      expect(res.body.fragment).toHaveProperty('id');
      expect(res.body.fragment.type).toBe('application/json');
      expect(res.body.fragment.size).toBe(Buffer.from(jsonString).length);
    });

    test('should create a Markdown fragment', async () => {
      const res = await request(testApp)
        .post('/v1/fragments')
        .set('Content-Type', 'text/markdown')
        .send(markdownData);

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('ok');
      expect(res.body.fragment).toHaveProperty('id');
      expect(res.body.fragment.type).toBe('text/markdown');
    });

    test('should reject unsupported content type', async () => {
      const res = await request(testApp)
        .post('/v1/fragments')
        .set('Content-Type', 'image/png')
        .send(Buffer.from('fake image data'));

      expect(res.statusCode).toBe(415);
      expect(res.body.status).toBe('error');
    });

    test('should reject request without Content-Type header', async () => {
      const res = await request(testApp)
        .post('/v1/fragments')
        .send(textData);

      expect(res.statusCode).toBe(415);
      expect(res.body.status).toBe('error');
    });
  });

  describe('GET /v1/fragments/:id', () => {
    test('should retrieve fragment data with correct Content-Type', async () => {
      // Create a fragment
      const postRes = await request(testApp)
        .post('/v1/fragments')
        .set('Content-Type', 'text/plain')
        .send(textData);

      const id = postRes.body.fragment.id;

      // Retrieve the fragment
      const getRes = await request(testApp).get(`/v1/fragments/${id}`);
      expect(getRes.statusCode).toBe(200);
      expect(getRes.headers['content-type']).toContain('text/plain');
      expect(getRes.text).toBe(textData);
    });

    test('should return 404 for unknown fragment', async () => {
      const res = await request(testApp).get('/v1/fragments/nonexistent-id');
      expect(res.statusCode).toBe(404);
      expect(res.body.status).toBe('error');
    });
  });

  describe('GET /v1/fragments/:id/info', () => {
    test('should return fragment metadata', async () => {
      // Create a fragment
      const postRes = await request(testApp)
        .post('/v1/fragments')
        .set('Content-Type', 'text/plain')
        .send(textData);

      const id = postRes.body.fragment.id;

      // Get fragment info
      const res = await request(testApp).get(`/v1/fragments/${id}/info`);
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.fragment).toHaveProperty('id');
      expect(res.body.fragment).toHaveProperty('type');
      expect(res.body.fragment).toHaveProperty('size');
      expect(res.body.fragment).toHaveProperty('created');
      expect(res.body.fragment).toHaveProperty('updated');
      expect(res.body.fragment).toHaveProperty('ownerId');
      expect(res.body.fragment.id).toBe(id);
      expect(res.body.fragment.type).toBe('text/plain');
      // Should not include data
      expect(res.body.fragment.data).toBeUndefined();
    });

    test('should return 404 for unknown fragment', async () => {
      const res = await request(testApp).get('/v1/fragments/nonexistent-id/info');
      expect(res.statusCode).toBe(404);
      expect(res.body.status).toBe('error');
    });
  });

  describe('GET /v1/fragments/:id.ext (conversion)', () => {
    test('should convert Markdown to HTML', async () => {
      // Create a Markdown fragment
      const postRes = await request(testApp)
        .post('/v1/fragments')
        .set('Content-Type', 'text/markdown')
        .send(markdownData);

      const id = postRes.body.fragment.id;

      // Convert to HTML
      const res = await request(testApp).get(`/v1/fragments/${id}.html`);
      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('text/html');
      expect(res.text).toContain('<h1>Title</h1>');
      expect(res.text).toContain('<strong>bold</strong>');
    });

    test('should return 415 for unsupported conversion', async () => {
      // Create a plain text fragment
      const postRes = await request(testApp)
        .post('/v1/fragments')
        .set('Content-Type', 'text/plain')
        .send(textData);

      const id = postRes.body.fragment.id;

      // Try to convert to HTML (not supported for text/plain)
      const res = await request(testApp).get(`/v1/fragments/${id}.html`);
      expect(res.statusCode).toBe(415);
      expect(res.body.status).toBe('error');
    });

    test('should return 404 for unknown fragment with extension', async () => {
      const res = await request(testApp).get('/v1/fragments/nonexistent-id.html');
      expect(res.statusCode).toBe(404);
      expect(res.body.status).toBe('error');
    });
  });
});

