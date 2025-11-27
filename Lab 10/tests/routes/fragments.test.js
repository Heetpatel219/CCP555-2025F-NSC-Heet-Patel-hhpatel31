const request = require('supertest');
const express = require('express');
const getFragments = require('../../src/routes/api/get');
const postFragment = require('../../src/routes/api/post');
const getFragmentById = require('../../src/routes/api/get-by-id');
const rawBody = require('../../src/routes/api/v1/rawBody');

const app = express();
app.use((req, res, next) => {
  req.user = 'user1@email.com'; // mock auth
  next();
});
app.use(rawBody());

app.get('/v1/fragments', getFragments);
app.post('/v1/fragments', postFragment);
app.get('/v1/fragments/:id', getFragmentById);

describe('Fragments routes', () => {
  const textData = 'Hello World';

  test('GET /v1/fragments returns an array', async () => {
    const res = await request(app).get('/v1/fragments');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  test('POST /v1/fragments creates a plain text fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send(textData);

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toHaveProperty('id');
    expect(res.body.fragment.type).toBe('text/plain');
  });

  test('POST /v1/fragments rejects unsupported content type', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'image/png')
      .send(Buffer.from('not really an image'));

    expect(res.statusCode).toBe(415);
    expect(res.body.status).toBe('error');
  });

  test('GET /v1/fragments/:id retrieves the fragment', async () => {
    const post = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send(textData);

    const id = post.body.fragment.id;

    const get = await request(app).get(`/v1/fragments/${id}`);
    expect(get.statusCode).toBe(200);
    expect(get.body.status).toBe('ok');
    expect(get.body.fragment.data).toBe(textData);
  });

  test('GET /v1/fragments/:id returns 404 for unknown fragment', async () => {
    const res = await request(app).get('/v1/fragments/nonexistent');
    expect(res.statusCode).toBe(404);
  });

  test('Requests without authentication fail', async () => {
    const noAuthApp = express();
    noAuthApp.get('/v1/fragments', getFragments);

    const res = await request(noAuthApp).get('/v1/fragments');
    expect(res.statusCode).toBe(500);
  });
});
