// src/api.js
import { config } from '../config.js';

const apiUrl = config.API_URL || 'http://localhost:8080';

export async function getUserFragments(user, expand = false) {
  console.log('Requesting user fragments data...');
  try {
    const url = new URL('/v1/fragments', apiUrl);
    if (expand) {
      url.searchParams.append('expand', '1');
    }
    const res = await fetch(url, { headers: user.authorizationHeaders() });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    console.log('Successfully got user fragments data', { data });
    return data;
  } catch (err) {
    console.error('Unable to call GET /v1/fragments', { err });
    throw err;
  }
}

export async function createFragment(user, content, contentType = 'text/plain') {
  console.log('Creating new fragment with type:', contentType);
  try {
    const url = new URL('/v1/fragments', apiUrl);
    const headers = user.authorizationHeaders();
    headers['Content-Type'] = contentType;
    
    const res = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: content
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`${res.status} ${res.statusText}: ${errorText}`);
    }
    
    // Get the Location header from the response
    const location = res.headers.get('Location');
    console.log('Location header:', location);
    
    const data = await res.json();
    // Add location to the response data for display
    data.location = location;
    console.log('Successfully created fragment', { data, location });
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
    // New API returns raw data, not JSON
    const text = await res.text();
    console.log('Successfully got fragment data', { text });
    return text;
  } catch (err) {
    console.error('Unable to call GET /v1/fragments/:id', { err });
    throw err;
  }
}

export async function getFragmentInfo(user, fragmentId) {
  console.log('Getting fragment metadata...');
  try {
    const url = new URL(`/v1/fragments/${fragmentId}/info`, apiUrl);
    const res = await fetch(url, { headers: user.authorizationHeaders() });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    console.log('Successfully got fragment info', { data });
    return data;
  } catch (err) {
    console.error('Unable to call GET /v1/fragments/:id/info', { err });
    throw err;
  }
}

export async function getFragmentAsHtml(user, fragmentId) {
  console.log('Getting fragment as HTML...');
  try {
    const url = new URL(`/v1/fragments/${fragmentId}.html`, apiUrl);
    const res = await fetch(url, { headers: user.authorizationHeaders() });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const html = await res.text();
    console.log('Successfully got fragment as HTML');
    return html;
  } catch (err) {
    console.error('Unable to call GET /v1/fragments/:id.html', { err });
    throw err;
  }
}
