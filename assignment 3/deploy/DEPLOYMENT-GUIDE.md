# AWS ECR & ECS Deployment Guide

This guide explains how to deploy both the **Backend (API)** and **Frontend (UI)** to AWS ECR and ECS separately.

## Prerequisites

1. **AWS CLI** installed and configured
2. **Docker Desktop** running
3. **AWS Academy credentials** (from Learner Lab)

## Step 1: Configure AWS CLI

Get your credentials from AWS Academy Learner Lab and configure:

```bash
# Create credentials file
mkdir -p ~/.aws

# Add your credentials (replace with your actual values)
cat > ~/.aws/credentials << EOF
[default]
aws_access_key_id=YOUR_ACCESS_KEY
aws_secret_access_key=YOUR_SECRET_KEY
aws_session_token=YOUR_SESSION_TOKEN
EOF

# Verify credentials
aws sts get-caller-identity
```

## Step 2: Get Your AWS Account ID

```bash
# Get and save your account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "Account ID: $ACCOUNT_ID"
```

## Step 3: Create ECR Repositories

```bash
# Create repository for API (backend)
aws ecr create-repository \
    --repository-name fragments \
    --image-scanning-configuration scanOnPush=true \
    --region us-east-1

# Create repository for UI (frontend)
aws ecr create-repository \
    --repository-name fragments-ui \
    --image-scanning-configuration scanOnPush=true \
    --region us-east-1

# Verify repositories
aws ecr describe-repositories --region us-east-1 \
    --query 'repositories[*].{Name:repositoryName,URI:repositoryUri}' --output table
```

## Step 4: Login to ECR

```bash
aws ecr get-login-password --region us-east-1 | \
    docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
```

**Expected output:** `Login Succeeded`

---

## Deploy Backend (API) to ECR

### Build the Backend Image

```bash
# Navigate to assignment 3 directory
cd "assignment 3"

# Build for linux/amd64 (required for AWS Fargate)
docker build --platform linux/amd64 -t fragments:latest .
```

### Tag and Push to ECR

```bash
# Tag the image
docker tag fragments:latest $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/fragments:latest

# Push to ECR
docker push $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/fragments:latest
```

### Verify Backend Image

```bash
aws ecr describe-images --repository-name fragments --region us-east-1 \
    --query 'imageDetails[*].{Tag:imageTags[0],Pushed:imagePushedAt}'
```

---

## Deploy Frontend (UI) to ECR

### Build the Frontend Image

```bash
# Navigate to Lab 2 directory
cd "../Lab 2"

# Build for linux/amd64
docker build --platform linux/amd64 -t fragments-ui:latest .
```

### Tag and Push to ECR

```bash
# Tag the image
docker tag fragments-ui:latest $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/fragments-ui:latest

# Push to ECR
docker push $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/fragments-ui:latest
```

### Verify Frontend Image

```bash
aws ecr describe-images --repository-name fragments-ui --region us-east-1 \
    --query 'imageDetails[*].{Tag:imageTags[0],Pushed:imagePushedAt}'
```

---

## Step 5: Create ECS Cluster

```bash
aws ecs create-cluster \
    --cluster-name fragments-cluster \
    --region us-east-1
```

## Step 6: Create Task Definitions

### Backend Task Definition

Create `fragments-task-definition.json`:

```json
{
    "family": "fragments-task",
    "containerDefinitions": [
        {
            "name": "fragments",
            "image": "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/fragments:latest",
            "cpu": 512,
            "memory": 1024,
            "essential": true,
            "portMappings": [
                {
                    "containerPort": 8080,
                    "hostPort": 8080,
                    "protocol": "tcp"
                }
            ],
            "environment": [
                {"name": "PORT", "value": "8080"},
                {"name": "LOG_LEVEL", "value": "info"},
                {"name": "AWS_REGION", "value": "us-east-1"},
                {"name": "AWS_S3_BUCKET_NAME", "value": "fragments-ACCOUNT_ID"},
                {"name": "AWS_DYNAMODB_TABLE_NAME", "value": "fragments"},
                {"name": "AWS_COGNITO_POOL_ID", "value": "YOUR_COGNITO_POOL_ID"},
                {"name": "AWS_COGNITO_CLIENT_ID", "value": "YOUR_COGNITO_CLIENT_ID"}
            ],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/fragments-task",
                    "awslogs-region": "us-east-1",
                    "awslogs-stream-prefix": "ecs"
                }
            }
        }
    ],
    "requiresCompatibilities": ["FARGATE"],
    "networkMode": "awsvpc",
    "cpu": "512",
    "memory": "1024",
    "executionRoleArn": "arn:aws:iam::ACCOUNT_ID:role/LabRole",
    "taskRoleArn": "arn:aws:iam::ACCOUNT_ID:role/LabRole"
}
```

### Frontend Task Definition

Create `fragments-ui-task-definition.json`:

```json
{
    "family": "fragments-ui-task",
    "containerDefinitions": [
        {
            "name": "fragments-ui",
            "image": "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/fragments-ui:latest",
            "cpu": 256,
            "memory": 512,
            "essential": true,
            "portMappings": [
                {
                    "containerPort": 80,
                    "hostPort": 80,
                    "protocol": "tcp"
                }
            ],
            "environment": [
                {"name": "API_URL", "value": "http://YOUR_API_ALB_DNS:80"},
                {"name": "AWS_COGNITO_POOL_ID", "value": "YOUR_COGNITO_POOL_ID"},
                {"name": "AWS_COGNITO_CLIENT_ID", "value": "YOUR_COGNITO_CLIENT_ID"},
                {"name": "AWS_COGNITO_DOMAIN", "value": "YOUR_COGNITO_DOMAIN"},
                {"name": "OAUTH_SIGN_IN_REDIRECT_URL", "value": "http://YOUR_UI_ALB_DNS"}
            ],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/fragments-ui-task",
                    "awslogs-region": "us-east-1",
                    "awslogs-stream-prefix": "ecs"
                }
            }
        }
    ],
    "requiresCompatibilities": ["FARGATE"],
    "networkMode": "awsvpc",
    "cpu": "256",
    "memory": "512",
    "executionRoleArn": "arn:aws:iam::ACCOUNT_ID:role/LabRole",
    "taskRoleArn": "arn:aws:iam::ACCOUNT_ID:role/LabRole"
}
```

### Register Task Definitions

```bash
# Register backend task
aws ecs register-task-definition \
    --cli-input-json file://fragments-task-definition.json \
    --region us-east-1

# Register frontend task
aws ecs register-task-definition \
    --cli-input-json file://fragments-ui-task-definition.json \
    --region us-east-1
```

## Step 7: Create Load Balancers and Services

(See the full submission.md for complete ALB, Target Group, and Service creation commands)

---

## Quick Deploy Script

For convenience, here's a script that builds and pushes both images:

```bash
#!/bin/bash
# deploy-to-ecr.sh

set -e

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION="us-east-1"
ECR_URL="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"

echo "Account ID: $ACCOUNT_ID"
echo "ECR URL: $ECR_URL"

# Login to ECR
echo "Logging into ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_URL

# Build and push backend
echo "Building and pushing backend..."
cd "assignment 3"
docker build --platform linux/amd64 -t fragments:latest .
docker tag fragments:latest $ECR_URL/fragments:latest
docker push $ECR_URL/fragments:latest

# Build and push frontend
echo "Building and pushing frontend..."
cd "../Lab 2"
docker build --platform linux/amd64 -t fragments-ui:latest .
docker tag fragments-ui:latest $ECR_URL/fragments-ui:latest
docker push $ECR_URL/fragments-ui:latest

echo "Done! Both images pushed to ECR."
```

---

## Verification

```bash
# List ECR images
aws ecr describe-images --repository-name fragments --region us-east-1
aws ecr describe-images --repository-name fragments-ui --region us-east-1

# Check ECS services
aws ecs describe-services --cluster fragments-cluster \
    --services fragments-service fragments-ui-service --region us-east-1 \
    --query 'services[*].{Name:serviceName,Status:status,Running:runningCount}'
```

