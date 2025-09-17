// src/api.js
const apiUrl = process.env.API_URL || 'http://localhost:8080';

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
