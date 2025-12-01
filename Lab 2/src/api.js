// src/api.js
import { config } from '../config.js';

const apiUrl = config.API_URL || 'http://localhost:8080';

// ============================================
// CORE FRAGMENT OPERATIONS
// ============================================

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
    const headers = user.authorizationHeaders(contentType);

    const res = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: content,
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`${res.status} ${res.statusText}: ${errorText}`);
    }

    const location = res.headers.get('Location');
    const data = await res.json();
    data.location = location;
    console.log('Successfully created fragment', { data, location });
    return data;
  } catch (err) {
    console.error('Unable to call POST /v1/fragments', { err });
    throw err;
  }
}

export async function getFragment(user, fragmentId, ext = '') {
  console.log('Getting fragment data...');
  try {
    const url = new URL(`/v1/fragments/${fragmentId}${ext}`, apiUrl);
    const res = await fetch(url, { headers: user.authorizationHeaders() });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

    const contentType = res.headers.get('Content-Type');
    if (contentType && contentType.startsWith('image/')) {
      const blob = await res.blob();
      return { type: 'image', data: URL.createObjectURL(blob), contentType };
    }

    const text = await res.text();
    return { type: 'text', data: text, contentType };
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

export async function updateFragment(user, fragmentId, content, contentType) {
  console.log('Updating fragment...');
  try {
    const url = new URL(`/v1/fragments/${fragmentId}`, apiUrl);
    const res = await fetch(url, {
      method: 'PUT',
      headers: user.authorizationHeaders(contentType),
      body: content,
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`${res.status} ${res.statusText}: ${errorText}`);
    }
    const data = await res.json();
    console.log('Successfully updated fragment', { data });
    return data;
  } catch (err) {
    console.error('Unable to call PUT /v1/fragments/:id', { err });
    throw err;
  }
}

export async function deleteFragment(user, fragmentId) {
  console.log('Deleting fragment...');
  try {
    const url = new URL(`/v1/fragments/${fragmentId}`, apiUrl);
    const res = await fetch(url, {
      method: 'DELETE',
      headers: user.authorizationHeaders(),
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    console.log('Successfully deleted fragment', { data });
    return data;
  } catch (err) {
    console.error('Unable to call DELETE /v1/fragments/:id', { err });
    throw err;
  }
}

// ============================================
// SEARCH
// ============================================

export async function searchFragments(user, query) {
  console.log('Searching fragments...', query);
  try {
    const url = new URL('/v1/fragments/search', apiUrl);
    if (query.type) url.searchParams.append('type', query.type);
    if (query.minSize) url.searchParams.append('minSize', query.minSize);
    if (query.maxSize) url.searchParams.append('maxSize', query.maxSize);
    if (query.tags) url.searchParams.append('tags', query.tags);

    const res = await fetch(url, { headers: user.authorizationHeaders() });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    console.log('Search results', { data });
    return data;
  } catch (err) {
    console.error('Unable to search fragments', { err });
    throw err;
  }
}

// ============================================
// TAGS
// ============================================

export async function getFragmentTags(user, fragmentId) {
  console.log('Getting fragment tags...');
  try {
    const url = new URL(`/v1/fragments/${fragmentId}/tags`, apiUrl);
    const res = await fetch(url, { headers: user.authorizationHeaders() });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    console.log('Got fragment tags', { data });
    return data;
  } catch (err) {
    console.error('Unable to get tags', { err });
    throw err;
  }
}

export async function addFragmentTags(user, fragmentId, tags) {
  console.log('Adding tags to fragment...');
  try {
    const url = new URL(`/v1/fragments/${fragmentId}/tags`, apiUrl);
    const res = await fetch(url, {
      method: 'POST',
      headers: user.authorizationHeaders('application/json'),
      body: JSON.stringify({ tags }),
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    console.log('Added tags', { data });
    return data;
  } catch (err) {
    console.error('Unable to add tags', { err });
    throw err;
  }
}

export async function autoTagFragment(user, fragmentId) {
  console.log('Auto-tagging fragment with Rekognition...');
  try {
    const url = new URL(`/v1/fragments/${fragmentId}/tags`, apiUrl);
    const res = await fetch(url, {
      method: 'POST',
      headers: user.authorizationHeaders('application/json'),
      body: JSON.stringify({ autoLabel: true }),
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    console.log('Auto-tagged', { data });
    return data;
  } catch (err) {
    console.error('Unable to auto-tag', { err });
    throw err;
  }
}

// ============================================
// SHARING
// ============================================

export async function getShareInfo(user, fragmentId) {
  console.log('Getting share info...');
  try {
    const url = new URL(`/v1/fragments/${fragmentId}/share`, apiUrl);
    const res = await fetch(url, { headers: user.authorizationHeaders() });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    console.log('Got share info', { data });
    return data;
  } catch (err) {
    console.error('Unable to get share info', { err });
    throw err;
  }
}

export async function shareFragment(user, fragmentId, email) {
  console.log('Sharing fragment...');
  try {
    const url = new URL(`/v1/fragments/${fragmentId}/share`, apiUrl);
    const res = await fetch(url, {
      method: 'POST',
      headers: user.authorizationHeaders('application/json'),
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    console.log('Shared fragment', { data });
    return data;
  } catch (err) {
    console.error('Unable to share', { err });
    throw err;
  }
}

export async function getSharedFragments(user) {
  console.log('Getting shared fragments...');
  try {
    const url = new URL('/v1/fragments/shared', apiUrl);
    const res = await fetch(url, { headers: user.authorizationHeaders() });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    console.log('Got shared fragments', { data });
    return data;
  } catch (err) {
    console.error('Unable to get shared fragments', { err });
    throw err;
  }
}

// ============================================
// VERSIONS
// ============================================

export async function getFragmentVersions(user, fragmentId) {
  console.log('Getting fragment versions...');
  try {
    const url = new URL(`/v1/fragments/${fragmentId}/versions`, apiUrl);
    const res = await fetch(url, { headers: user.authorizationHeaders() });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    console.log('Got versions', { data });
    return data;
  } catch (err) {
    console.error('Unable to get versions', { err });
    throw err;
  }
}

// ============================================
// AI FEATURES (Textract, Rekognition)
// ============================================

export async function extractText(user, fragmentId, saveAsFragment = false) {
  console.log('Extracting text from image...');
  try {
    const url = new URL(`/v1/fragments/${fragmentId}/extract-text`, apiUrl);
    const res = await fetch(url, {
      method: 'POST',
      headers: user.authorizationHeaders('application/json'),
      body: JSON.stringify({ saveAsFragment }),
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    console.log('Extracted text', { data });
    return data;
  } catch (err) {
    console.error('Unable to extract text', { err });
    throw err;
  }
}

export async function detectLabels(user, fragmentId, autoTag = false) {
  console.log('Detecting labels in image...');
  try {
    const url = new URL(`/v1/fragments/${fragmentId}/detect-labels`, apiUrl);
    const res = await fetch(url, {
      method: 'POST',
      headers: user.authorizationHeaders('application/json'),
      body: JSON.stringify({ autoTag }),
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    console.log('Detected labels', { data });
    return data;
  } catch (err) {
    console.error('Unable to detect labels', { err });
    throw err;
  }
}

// ============================================
// ANALYTICS
// ============================================

export async function getAnalytics(user) {
  console.log('Getting analytics...');
  try {
    const url = new URL('/v1/fragments/analytics', apiUrl);
    const res = await fetch(url, { headers: user.authorizationHeaders() });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    console.log('Got analytics', { data });
    return data;
  } catch (err) {
    console.error('Unable to get analytics', { err });
    throw err;
  }
}

export async function getFragmentAnalytics(user, fragmentId) {
  console.log('Getting fragment analytics...');
  try {
    const url = new URL(`/v1/fragments/${fragmentId}/analytics`, apiUrl);
    const res = await fetch(url, { headers: user.authorizationHeaders() });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    console.log('Got fragment analytics', { data });
    return data;
  } catch (err) {
    console.error('Unable to get fragment analytics', { err });
    throw err;
  }
}
