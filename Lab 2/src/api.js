// src/api.js
import { config } from '../config.js';

const apiUrl = config.API_URL || 'http://localhost:8080';

export async function getUserFragments(user) {
  console.log('Requesting user fragments data...');
  try {
    const url = new URL('/v1/fragments', apiUrl);
    const res = await fetch(url, { headers: user.authorizationHeaders() });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    console.log('Successfully got user fragments data', { data });
    return data;
  } catch (err) {
    console.error('Unable to call GET /v1/fragments', { err });
  }
}

export async function createFragment(user, content) {
  console.log('Creating new fragment...');
  try {
    const url = new URL('/v1/fragments', apiUrl);
    const res = await fetch(url, {
      method: 'POST',
      headers: user.authorizationHeaders('text/plain'),
      body: content
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    console.log('Successfully created fragment', { data });
    return data;
  } catch (err) {
    console.error('Unable to call POST /v1/fragments', { err });
    throw err;
  }
}

export async function getFragment(user, fragmentId) {
  console.log('Getting fragment data...');
  try {
    const url = new URL(`/v1/fragments/${fragmentId}`, apiUrl);
    const res = await fetch(url, { headers: user.authorizationHeaders() });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    console.log('Successfully got fragment data', { data });
    return data;
  } catch (err) {
    console.error('Unable to call GET /v1/fragments/:id', { err });
    throw err;
  }
}
