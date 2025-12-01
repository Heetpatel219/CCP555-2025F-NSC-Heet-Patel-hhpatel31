// Configuration file for Fragments UI
// Uses runtime config (injected by Docker) if available, falls back to defaults

const runtimeConfig = typeof window !== 'undefined' && window.__RUNTIME_CONFIG__;

export const config = {
  // AWS Cognito Configuration
  AWS_COGNITO_POOL_ID: runtimeConfig?.cognitoPoolId || 'us-east-1_qgh5BHmhF',
  AWS_COGNITO_CLIENT_ID: runtimeConfig?.cognitoClientId || '696dkue673bnicfbe2clsrd7r3',
  AWS_COGNITO_DOMAIN_URL: runtimeConfig?.cognitoDomain 
    ? `https://${runtimeConfig.cognitoDomain}.auth.us-east-1.amazoncognito.com`
    : 'https://us-east-1qgh5bhmhf.auth.us-east-1.amazoncognito.com',
  
  // API Configuration
  API_URL: runtimeConfig?.apiUrl || 'http://localhost:8080',
  
  // OAuth Configuration
  OAUTH_SIGN_IN_REDIRECT_URL: runtimeConfig?.redirectUrl || 'http://localhost:1234'
};

console.log('Config loaded:', config);
