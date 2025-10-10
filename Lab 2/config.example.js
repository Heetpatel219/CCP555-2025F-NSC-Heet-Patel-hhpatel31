// Copy this file to config.js and update with your actual values

export const config = {
  // AWS Cognito Configuration
  AWS_COGNITO_POOL_ID: 'us-east-1_YOUR_POOL_ID',
  AWS_COGNITO_CLIENT_ID: 'YOUR_CLIENT_ID',
  AWS_COGNITO_DOMAIN_URL: 'https://YOUR_DOMAIN.auth.us-east-1.amazoncognito.com',
  
  // API Configuration
  API_URL: 'http://YOUR_EC2_IP:8080',
  
  // OAuth Configuration
  OAUTH_SIGN_IN_REDIRECT_URL: 'http://YOUR_EC2_IP:1234'
};

