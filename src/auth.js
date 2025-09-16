// src/auth.js
import { UserManager } from 'oidc-client-ts';

const poolId   = (process.env.AWS_COGNITO_POOL_ID || '').trim();
const clientId = (process.env.AWS_COGNITO_CLIENT_ID || '').trim();
const domain   = (process.env.AWS_COGNITO_DOMAIN_URL || '').replace(/\/+$/, '');
const redirect = (process.env.OAUTH_SIGN_IN_REDIRECT_URL || 'http://localhost:1234').replace(/\/+$/, '');

if (!poolId || !clientId || !domain) {
  throw new Error('Missing env: AWS_COGNITO_POOL_ID / AWS_COGNITO_CLIENT_ID / AWS_COGNITO_DOMAIN_URL');
}

const region = poolId.split('_')[0];
const issuer = `https://cognito-idp.${region}.amazonaws.com/${poolId}`;

// Seed full metadata to avoid discovery (Learner Lab safe)
const metadataSeed = {
  issuer,
  authorization_endpoint: `${domain}/oauth2/authorize`,
  token_endpoint:         `${domain}/oauth2/token`,
  userinfo_endpoint:      `${domain}/oauth2/userInfo`,
  revocation_endpoint:    `${domain}/oauth2/revoke`,
  end_session_endpoint:   `${domain}/logout`,
  jwks_uri:               `${issuer}/.well-known/jwks.json`,
};

console.log('OIDC (no-discovery) config', { issuer, domain, clientId, redirect });

export const userManager = new UserManager({
  authority: issuer,
  metadataSeed,
  client_id: clientId,
  redirect_uri: redirect,
  response_type: 'code',
  scope: 'openid email profile',
  revokeTokenTypes: ['refresh_token'],
  automaticSilentRenew: false,
});

function formatUser(user) {
  return {
    username: user?.profile?.['cognito:username'],
    email: user?.profile?.email,
    idToken: user?.id_token,
    accessToken: user?.access_token,
    authorizationHeaders: (type = 'application/json') => ({
      'Content-Type': type,
      Authorization: `Bearer ${user.id_token}`,
    }),
  };
}

export function signIn() {
  return userManager.signinRedirect();
}

export function signOut() {
  return userManager.signoutRedirect();
}

export async function getUser() {
  if (window.location.search.includes('code=')) {
    const user = await userManager.signinCallback();
    window.history.replaceState({}, document.title, window.location.pathname);
    return formatUser(user);
  }
  const user = await userManager.getUser();
  return user ? formatUser(user) : null;
}
