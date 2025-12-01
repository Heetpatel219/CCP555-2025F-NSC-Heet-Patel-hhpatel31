#!/bin/sh

# Docker entrypoint script for Fragments UI
# Creates runtime configuration from environment variables

# Create runtime config file
cat > /usr/share/nginx/html/runtime-config.js << EOF
window.__RUNTIME_CONFIG__ = {
  apiUrl: "${API_URL:-http://localhost:8080}",
  cognitoPoolId: "${AWS_COGNITO_POOL_ID:-}",
  cognitoClientId: "${AWS_COGNITO_CLIENT_ID:-}",
  cognitoDomain: "${AWS_COGNITO_DOMAIN:-}",
  redirectUrl: "${OAUTH_SIGN_IN_REDIRECT_URL:-http://localhost:1234}"
};
EOF

echo "Runtime configuration created:"
cat /usr/share/nginx/html/runtime-config.js

# Execute the main command
exec "$@"

