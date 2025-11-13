// src/auth.js
import { UserManager } from 'oidc-client-ts';
import { config } from '../config.js';

const poolId   = (config.AWS_COGNITO_POOL_ID || '').trim();
const clientId = (config.AWS_COGNITO_CLIENT_ID || '').trim();
const domain   = (config.AWS_COGNITO_DOMAIN_URL || '').replace(/\/+$/, '');
const redirect = (config.OAUTH_SIGN_IN_REDIRECT_URL || 'http://localhost:1234').replace(/\/+$/, '');

// Force mock authentication for testing (set to true to disable real Cognito)
const useMockAuth = false; // Set to true to use mock auth, false for real Cognito

// Mock user for testing
const mockUser = {
  username: 'Heet',
  email: 'heet@gmail.com',
  idToken: 'mock-jwt-token-for-testing',
  accessToken: 'mock-access-token',
  authorizationHeaders: function(type = 'application/json') {
    return {
      'Content-Type': type,
      Authorization: 'Bearer mock-jwt-token-for-testing',
    };
  },
};

// Real Cognito setup
let userManager = null;
if (!useMockAuth) {
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

  userManager = new UserManager({
    authority: issuer,
    metadataSeed,
    client_id: clientId,
    redirect_uri: redirect,
    response_type: 'code',
    scope: 'openid email profile',
    revokeTokenTypes: ['refresh_token'],
    automaticSilentRenew: false,
  });
}

function formatUser(user) {
  console.log('Raw user from Cognito:', user);
  console.log('User profile:', user?.profile);
  
  // Try to extract email from JWT token if not in profile
  let email = user?.profile?.email;
  if (!email && user?.id_token) {
    try {
      // Decode JWT token to get email (JWT is base64 encoded)
      const payload = JSON.parse(atob(user.id_token.split('.')[1]));
      email = payload.email || payload['cognito:username'];
      console.log('Extracted email from JWT:', email);
    } catch (e) {
      console.warn('Could not decode JWT token:', e);
    }
  }
  
  const formatted = {
    username: user?.profile?.['cognito:username'],
    email: email,
    idToken: user?.id_token,
    accessToken: user?.access_token,
    authorizationHeaders: (type = 'application/json') => ({
      'Content-Type': type,
      Authorization: `Bearer ${user.id_token}`,
    }),
  };
  
  console.log('Formatted user:', formatted);
  return formatted;
}

export function signIn() {
  if (useMockAuth) {
    console.log('Using mock authentication for testing');
    // Simulate login by storing user in sessionStorage
    sessionStorage.setItem('mockUser', JSON.stringify(mockUser));
    // Reload page to trigger getUser()
    window.location.reload();
  } else {
    return userManager.signinRedirect();
  }
}

export function signOut() {
  if (useMockAuth) {
    // Simulate logout by removing user from sessionStorage
    sessionStorage.removeItem('mockUser');
    // Reload page to trigger getUser()
    window.location.reload();
  } else {
    return userManager.signoutRedirect();
  }
}

export async function getUser() {
  if (useMockAuth) {
    // Check if user is in sessionStorage
    const storedUser = sessionStorage.getItem('mockUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      // Ensure authorizationHeaders is a function
      user.authorizationHeaders = function(type = 'application/json') {
        return {
          'Content-Type': type,
          Authorization: 'Bearer mock-jwt-token-for-testing',
        };
      };
      return user;
    }
    return null;
  } else {
    if (window.location.search.includes('code=')) {
      const user = await userManager.signinCallback();
      window.history.replaceState({}, document.title, window.location.pathname);
      return formatUser(user);
    }
    const user = await userManager.getUser();
    return user ? formatUser(user) : null;
  }
}
