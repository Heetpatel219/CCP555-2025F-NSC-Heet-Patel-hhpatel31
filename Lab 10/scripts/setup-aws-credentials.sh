#!/bin/bash

# Setup AWS credentials script
# Run this script to configure AWS CLI credentials

AWS_DIR="$HOME/.aws"

# Create .aws directory if it doesn't exist
mkdir -p "$AWS_DIR"

# Create credentials file
# NOTE: This script reads AWS credentials from environment variables
# Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and optionally AWS_SESSION_TOKEN
# before running this script

if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "Error: AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables must be set"
    echo "Please set these environment variables and run the script again"
    exit 1
fi

cat > "$AWS_DIR/credentials" << EOF
[default]
aws_access_key_id=$AWS_ACCESS_KEY_ID
aws_secret_access_key=$AWS_SECRET_ACCESS_KEY
EOF

if [ -n "$AWS_SESSION_TOKEN" ]; then
    echo "aws_session_token=$AWS_SESSION_TOKEN" >> "$AWS_DIR/credentials"
fi

# Create config file
cat > "$AWS_DIR/config" << 'EOF'
[default]
region = us-east-1
output = json
EOF

echo "AWS credentials configured successfully!"
echo "Credentials file: $AWS_DIR/credentials"
echo "Config file: $AWS_DIR/config"

