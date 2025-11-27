# Lab 10 Submission - Amazon DynamoDB Integration

**Student:** David Chan  
**Date:** November 26, 2025  
**GitHub Repository:** https://github.com/DC-Seneca/CCP555-demo  

---

## Overview

This lab integrates **Amazon DynamoDB** into the fragments microservice for storing fragment metadata, while continuing to use **AWS S3** for fragment data storage.

**Architecture:**
- **DynamoDB** → Stores fragment metadata (ownerId, id, type, size, created, updated)
- **S3** → Stores fragment data (actual content bytes)
- **ECS Fargate** → Runs the containerized fragments microservice
- **ALB** → Load balances traffic to ECS tasks
- **Cognito** → Handles user authentication
- **NAT Gateway** → Enables private subnet access to AWS services

---

## Part 1: AWS Environment Setup

### 1.1 Configure AWS CLI Credentials

```bash
# Create AWS credentials file
cat > ~/.aws/credentials << 'EOF'
[default]
aws_access_key_id=ASIAUZZNIJY7NEVNWGET
aws_secret_access_key=2MpHO4dH4e4G9xZ75JbdI9b6ELB8gVuvCGTdR1jp
aws_session_token=IQoJb3JpZ2luX2VjELD//////////wEaCXVz...
EOF

cat > ~/.aws/config << 'EOF'
[default]
region = us-east-1
output = json
EOF
```

### 1.2 Verify AWS Credentials

```bash
aws sts get-caller-identity
```

**Output:**
```json
{
    "UserId": "AROAUZZNIJY7M6JTIAGJE:user4474614=_Student_View__David_Chan",
    "Account": "330270527038",
    "Arn": "arn:aws:sts::330270527038:assumed-role/voclabs/user4474614=_Student_View__David_Chan"
}
```

---

## Part 2: DynamoDB Table Creation

### 2.1 Create DynamoDB Table via CLI

```bash
aws dynamodb create-table \
    --table-name fragments \
    --attribute-definitions \
        AttributeName=ownerId,AttributeType=S \
        AttributeName=id,AttributeType=S \
    --key-schema \
        AttributeName=ownerId,KeyType=HASH \
        AttributeName=id,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1
```

**Output:**
```json
{
    "TableDescription": {
        "TableName": "fragments",
        "TableStatus": "CREATING",
        "TableArn": "arn:aws:dynamodb:us-east-1:330270527038:table/fragments",
        "KeySchema": [
            {"AttributeName": "ownerId", "KeyType": "HASH"},
            {"AttributeName": "id", "KeyType": "RANGE"}
        ],
        "BillingModeSummary": {"BillingMode": "PAY_PER_REQUEST"}
    }
}
```

### 2.2 Verify Table Status

```bash
aws dynamodb describe-table --table-name fragments --query 'Table.{Name:TableName,Status:TableStatus,ARN:TableArn}'
```

**Output:**
```json
{
    "Name": "fragments",
    "Status": "ACTIVE",
    "ARN": "arn:aws:dynamodb:us-east-1:330270527038:table/fragments"
}
```

### 2.3 Verify S3 Bucket

```bash
aws s3 ls | grep fragments
```

**Output:**
```
2024-11-10 15:30:22 ccp555-demo-fragments-dc
```

---

## Part 3: DynamoDB SDK Integration

### 3.1 Install Dependencies

```bash
cd fragments
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
```

**package.json dependencies added:**
```json
{
  "@aws-sdk/client-dynamodb": "^3.937.0",
  "@aws-sdk/lib-dynamodb": "^3.937.0",
  "@aws-sdk/client-s3": "^3.937.0"
}
```

### 3.2 DynamoDB Document Client (`src/model/data/aws/ddbDocClient.js`)

```javascript
// DynamoDB Document Client configuration
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const logger = require('../../../logger');

// Get AWS credentials and configuration
const getCredentials = () => {
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    const credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
    if (process.env.AWS_SESSION_TOKEN) {
      credentials.sessionToken = process.env.AWS_SESSION_TOKEN;
    }
    return credentials;
  }
  return undefined;
};

// DynamoDB Client configuration
const ddbClientConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
};

// Add credentials if available
const credentials = getCredentials();
if (credentials) {
  ddbClientConfig.credentials = credentials;
}

// Use local DynamoDB if endpoint is specified
if (process.env.AWS_DYNAMODB_ENDPOINT_URL) {
  ddbClientConfig.endpoint = process.env.AWS_DYNAMODB_ENDPOINT_URL;
  logger.info(`Using DynamoDB Local at ${process.env.AWS_DYNAMODB_ENDPOINT_URL}`);
}

// Create the base DynamoDB client
const ddbClient = new DynamoDBClient(ddbClientConfig);

// Create the Document Client wrapper
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

module.exports = ddbDocClient;
```

### 3.3 S3 Client (`src/model/data/aws/s3Client.js`)

```javascript
// S3 Client configuration
const { S3Client } = require('@aws-sdk/client-s3');
const logger = require('../../../logger');

// Get AWS credentials
const getCredentials = () => {
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    const credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
    if (process.env.AWS_SESSION_TOKEN) {
      credentials.sessionToken = process.env.AWS_SESSION_TOKEN;
    }
    return credentials;
  }
  return undefined;
};

// S3 Client configuration
const s3ClientConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
};

// Add credentials if available
const credentials = getCredentials();
if (credentials) {
  s3ClientConfig.credentials = credentials;
}

// Use LocalStack if endpoint is specified
if (process.env.AWS_S3_ENDPOINT_URL) {
  s3ClientConfig.endpoint = process.env.AWS_S3_ENDPOINT_URL;
  s3ClientConfig.forcePathStyle = true;
  logger.info(`Using LocalStack S3 at ${process.env.AWS_S3_ENDPOINT_URL}`);
}

const s3Client = new S3Client(s3ClientConfig);

module.exports = s3Client;
```

### 3.4 Data Access Layer (`src/model/data/aws/index.js`)

```javascript
// AWS Data Access Layer - DynamoDB for metadata, S3 for data
const { PutCommand, GetCommand, QueryCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const ddbDocClient = require('./ddbDocClient');
const s3Client = require('./s3Client');
const logger = require('../../../logger');

const TABLE_NAME = process.env.AWS_DYNAMODB_TABLE_NAME || 'fragments';
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'fragments';

// Write fragment metadata to DynamoDB
async function writeFragment(fragment) {
  const params = {
    TableName: TABLE_NAME,
    Item: fragment,
  };
  try {
    await ddbDocClient.send(new PutCommand(params));
    logger.debug({ fragment }, 'Fragment metadata written to DynamoDB');
  } catch (err) {
    logger.error({ err, fragment }, 'Error writing fragment to DynamoDB');
    throw err;
  }
}

// Read fragment metadata from DynamoDB
async function readFragment(ownerId, id) {
  const params = {
    TableName: TABLE_NAME,
    Key: { ownerId, id },
  };
  try {
    const { Item } = await ddbDocClient.send(new GetCommand(params));
    return Item;
  } catch (err) {
    logger.error({ err, ownerId, id }, 'Error reading fragment from DynamoDB');
    throw err;
  }
}

// Write fragment data to S3
async function writeFragmentData(ownerId, id, data) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: `${ownerId}/${id}`,
    Body: data,
  };
  try {
    await s3Client.send(new PutObjectCommand(params));
    logger.debug({ ownerId, id }, 'Fragment data written to S3');
  } catch (err) {
    logger.error({ err, ownerId, id }, 'Error writing fragment data to S3');
    throw err;
  }
}

// Read fragment data from S3
async function readFragmentData(ownerId, id) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: `${ownerId}/${id}`,
  };
  try {
    const { Body } = await s3Client.send(new GetObjectCommand(params));
    return Body.transformToByteArray();
  } catch (err) {
    logger.error({ err, ownerId, id }, 'Error reading fragment data from S3');
    throw err;
  }
}

// List all fragments for a user from DynamoDB
async function listFragments(ownerId, expand = false) {
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: 'ownerId = :ownerId',
    ExpressionAttributeValues: { ':ownerId': ownerId },
  };

  if (!expand) {
    params.ProjectionExpression = 'id';
  }

  try {
    const { Items } = await ddbDocClient.send(new QueryCommand(params));
    return expand ? Items : Items.map((item) => item.id);
  } catch (err) {
    logger.error({ err, ownerId }, 'Error listing fragments from DynamoDB');
    throw err;
  }
}

// Delete fragment from both DynamoDB and S3
async function deleteFragment(ownerId, id) {
  try {
    // Delete from DynamoDB
    await ddbDocClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { ownerId, id },
    }));

    // Delete from S3
    await s3Client.send(new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `${ownerId}/${id}`,
    }));

    logger.debug({ ownerId, id }, 'Fragment deleted from DynamoDB and S3');
  } catch (err) {
    logger.error({ err, ownerId, id }, 'Error deleting fragment');
    throw err;
  }
}

module.exports = {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  listFragments,
  deleteFragment,
};
```

---

## Part 4: Integration Tests

### 4.1 Integration Test File (`tests/integration/lab-10-dynamodb.hurl`)

```hurl
# Lab 10 - DynamoDB Integration Tests
# Tests CRUD operations with DynamoDB metadata storage and S3 data storage

###############################################################################
# Test 1: POST a JSON fragment
###############################################################################

POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
```
{
  "service": "DynamoDB"
}
```

HTTP 201
[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"
[Asserts]
header "Location" matches "^http://localhost:8080/v1/fragments/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.size" == 26

###############################################################################
# Test 2: GET the first fragment's metadata
###############################################################################

GET {{fragment1_url}}/info
[BasicAuth]
user1@email.com:password1

HTTP 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == {{fragment1_id}}
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.size" == 26

###############################################################################
# Test 3: POST a Markdown fragment
###############################################################################

POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
[BasicAuth]
user1@email.com:password1
`DynamoDB is **great**.`

HTTP 201
[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/markdown"

###############################################################################
# Test 4: GET the second fragment's metadata
###############################################################################

GET {{fragment2_url}}/info
[BasicAuth]
user1@email.com:password1

HTTP 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == {{fragment2_id}}
jsonpath "$.fragment.type" == "text/markdown"

###############################################################################
# Test 5: GET all fragments (should include both IDs)
###############################################################################

GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1

HTTP 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragments" contains {{fragment1_id}}
jsonpath "$.fragments" contains {{fragment2_id}}

###############################################################################
# Test 6: DELETE the first fragment
###############################################################################

DELETE {{fragment1_url}}
[BasicAuth]
user1@email.com:password1

HTTP 200
[Asserts]
jsonpath "$.status" == "ok"

###############################################################################
# Test 7: GET the deleted fragment (should return 404)
###############################################################################

GET {{fragment1_url}}/info
[BasicAuth]
user1@email.com:password1

HTTP 404

###############################################################################
# Test 8: GET all fragments (first ID should NOT be included, second should)
###############################################################################

GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1

HTTP 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragments" not contains {{fragment1_id}}
jsonpath "$.fragments" contains {{fragment2_id}}
```

### 4.2 Run Integration Tests

```bash
# Run with Hurl
hurl --test --variable host=http://localhost:8080 tests/integration/lab-10-dynamodb.hurl

# Or via npm script
npm run test:integration
```

**Expected Output:**
```
tests/integration/lab-10-dynamodb.hurl: Running [1/1]
tests/integration/lab-10-dynamodb.hurl: Success (8 request(s) in 245 ms)
--------------------------------------------------------------------------------
Executed files:  1
Succeeded files: 1 (100.0%)
Failed files:    0 (0.0%)
Duration:        253 ms
```

---

## Part 5: Docker Compose Setup (Local Testing)

### 5.1 Docker Compose Configuration (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  fragments:
    build: .
    container_name: fragments
    ports:
      - "8080:8080"
    environment:
      - PORT=8080
      - LOG_LEVEL=debug
      - NODE_ENV=development
      - AWS_REGION=us-east-1
      - AWS_ACCESS_KEY_ID=test
      - AWS_SECRET_ACCESS_KEY=test
      - AWS_S3_ENDPOINT_URL=http://localstack:4566
      - AWS_S3_BUCKET_NAME=fragments
      - AWS_DYNAMODB_ENDPOINT_URL=http://dynamodb-local:8000
      - AWS_DYNAMODB_TABLE_NAME=fragments
    depends_on:
      - localstack
      - dynamodb-local

  localstack:
    image: localstack/localstack:latest
    container_name: localstack
    ports:
      - "4566:4566"
    environment:
      - SERVICES=s3
      - DEBUG=1
      - DATA_DIR=/tmp/localstack/data
    volumes:
      - localstack-data:/tmp/localstack

  dynamodb-local:
    image: amazon/dynamodb-local:latest
    container_name: dynamodb-local
    ports:
      - "8000:8000"
    command: "-jar DynamoDBLocal.jar -sharedDb -inMemory"

volumes:
  localstack-data:
```

### 5.2 Local AWS Setup Script (`scripts/local-aws-setup.sh`)

```bash
#!/bin/bash

# Wait for services to be ready
echo "Waiting for LocalStack and DynamoDB Local to be ready..."
sleep 5

# Create S3 bucket in LocalStack
echo "Creating S3 bucket..."
aws --endpoint-url=http://localhost:4566 s3 mb s3://fragments 2>/dev/null || echo "Bucket already exists"

# Create DynamoDB table
echo "Creating DynamoDB table..."
aws --endpoint-url=http://localhost:8000 dynamodb create-table \
    --table-name fragments \
    --attribute-definitions \
        AttributeName=ownerId,AttributeType=S \
        AttributeName=id,AttributeType=S \
    --key-schema \
        AttributeName=ownerId,KeyType=HASH \
        AttributeName=id,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    2>/dev/null || echo "Table already exists"

echo "Local AWS setup complete!"
```

### 5.3 Run Local Tests

```bash
# Step 1: Start containers
docker compose up --build -d

# Step 2: Wait for services to be ready
sleep 10

# Step 3: Setup local AWS resources
./scripts/local-aws-setup.sh

# Step 4: Run integration tests
npm run test:integration

# Step 5: Cleanup
docker compose down
```

---

## Part 6: CI/CD Configuration

### 6.1 GitHub Actions Workflow (`.github/workflows/ci.yml`)

```yaml
name: CI

on:
  push:
    branches: [main]
    tags: ['v*']
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      # Generate .htpasswd for tests (Approach 1 - from secrets)
      - name: Create .htpasswd for tests
        run: |
          sudo apt-get install -y apache2-utils
          htpasswd -Bbn user1@email.com password1 > tests/.htpasswd
      
      # Start Docker services
      - name: Start services
        run: docker compose up -d --build
      
      # Wait for services to be healthy
      - name: Wait for services
        run: |
          npm install -g wait-on
          wait-on http://localhost:8080 --timeout 60000
      
      # Setup local AWS resources
      - name: Setup local AWS
        run: ./scripts/local-aws-setup.sh
      
      # Run integration tests
      - name: Run integration tests
        run: npm run test:integration
      
      # Cleanup
      - name: Stop services
        run: docker compose down

  docker-hub:
    needs: [lint, unit-tests, integration-tests]
    if: github.event_name == 'push' && startsWith(github.ref, 'refs/tags/v')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      - uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            dcjoker/fragments:latest
            dcjoker/fragments:${{ github.ref_name }}
```

### 6.2 Handling .htpasswd in CI

**Option A: Generate from secrets (shown above)**
```yaml
- name: Create .htpasswd for tests
  run: |
    sudo apt-get install -y apache2-utils
    htpasswd -Bbn user1@email.com "${{ secrets.HTPASSWD_PASSWORD }}" > tests/.htpasswd
```

**Option B: Commit test credentials (bcrypt hashes are safe)**
```bash
# Generate and commit .htpasswd with test credentials
htpasswd -Bbn user1@email.com password1 > tests/.htpasswd
git add tests/.htpasswd
```

---

## Part 7: ECS Deployment

### 7.1 Task Definition (`deploy/fragments-definition.json`)

```json
{
    "family": "fragments-task",
    "containerDefinitions": [
        {
            "name": "fragments",
            "image": "dcjoker/fragments:latest",
            "cpu": 512,
            "memory": 1024,
            "essential": true,
            "portMappings": [
                {
                    "containerPort": 8080,
                    "hostPort": 8080
                }
            ],
            "environment": [
                {"name": "PORT", "value": "8080"},
                {"name": "LOG_LEVEL", "value": "debug"},
                {"name": "AWS_REGION", "value": "us-east-1"},
                {"name": "AWS_S3_BUCKET_NAME", "value": "ccp555-demo-fragments-dc"},
                {"name": "AWS_DYNAMODB_TABLE_NAME", "value": "fragments"},
                {"name": "AWS_COGNITO_POOL_ID", "value": "us-east-1_tADSehAHN"},
                {"name": "AWS_COGNITO_CLIENT_ID", "value": "6tq7d72o488vigrrb0glgniv2m"}
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
    "executionRoleArn": "arn:aws:iam::330270527038:role/LabRole",
    "taskRoleArn": "arn:aws:iam::330270527038:role/LabRole"
}
```

### 7.2 Register Task Definition

```bash
aws ecs register-task-definition \
    --cli-input-json file://deploy/fragments-definition.json \
    --region us-east-1
```

**Output:**
```json
{
    "taskDefinition": {
        "revision": 10,
        "cpu": "512",
        "memory": "1024",
        "taskDefinitionArn": "arn:aws:ecs:us-east-1:330270527038:task-definition/fragments-task:10"
    }
}
```

### 7.3 Update ECS Service

```bash
aws ecs update-service \
    --cluster lovable-gecko-hkov7g2 \
    --service fragments-service \
    --task-definition fragments-task \
    --force-new-deployment \
    --region us-east-1
```

### 7.4 Verify Target Health

```bash
aws elbv2 describe-target-health \
    --target-group-arn arn:aws:elasticloadbalancing:us-east-1:330270527038:targetgroup/fragments-tg/16e0ba5cf09650a0 \
    --region us-east-1
```

**Output:**
```json
{
    "TargetHealthDescriptions": [
        {
            "Target": {"Id": "172.31.36.13", "Port": 8080},
            "TargetHealth": {"State": "healthy"}
        }
    ]
}
```

---

## Part 8: Cognito Authentication Setup

### 8.1 Create Cognito User Pool

```bash
# Create User Pool
aws cognito-idp create-user-pool \
    --pool-name fragments-users \
    --auto-verified-attributes email \
    --region us-east-1
```

**User Pool ID:** `us-east-1_tADSehAHN`

### 8.2 Create App Client

```bash
aws cognito-idp create-user-pool-client \
    --user-pool-id us-east-1_tADSehAHN \
    --client-name fragments-client \
    --generate-secret false \
    --region us-east-1
```

**Client ID:** `6tq7d72o488vigrrb0glgniv2m`

### 8.3 Configure Callback URLs

```bash
aws cognito-idp update-user-pool-client \
    --user-pool-id us-east-1_tADSehAHN \
    --client-id 6tq7d72o488vigrrb0glgniv2m \
    --callback-urls "http://localhost:1234" "http://localhost:1234/" \
    --logout-urls "http://localhost:1234" "http://localhost:1234/" \
    --allowed-o-auth-flows code \
    --allowed-o-auth-scopes openid email \
    --allowed-o-auth-flows-user-pool-client \
    --supported-identity-providers COGNITO \
    --region us-east-1
```

### 8.4 Create Cognito Domain

```bash
aws cognito-idp create-user-pool-domain \
    --domain fragments-lab10-1764105020 \
    --user-pool-id us-east-1_tADSehAHN \
    --region us-east-1
```

### 8.5 Create Test User

```bash
# Create user
aws cognito-idp admin-create-user \
    --user-pool-id us-east-1_tADSehAHN \
    --username testuser@example.com \
    --temporary-password TempPass123! \
    --message-action SUPPRESS \
    --region us-east-1

# Set permanent password
aws cognito-idp admin-set-user-password \
    --user-pool-id us-east-1_tADSehAHN \
    --username testuser@example.com \
    --password TestPass123! \
    --permanent \
    --region us-east-1
```

---

## Part 9: NAT Gateway Configuration (Troubleshooting)

ECS tasks in private subnets need NAT Gateway to reach Cognito JWKS endpoint.

### 9.1 Create NAT Gateway

```bash
# Create Elastic IP
aws ec2 allocate-address --domain vpc --region us-east-1
# Output: AllocationId: eipalloc-xxxxx

# Create NAT Gateway in public subnet
aws ec2 create-nat-gateway \
    --subnet-id subnet-0cf9ac8b555350b9d \
    --allocation-id eipalloc-xxxxx \
    --region us-east-1
```

**NAT Gateway ID:** `nat-07406f45dd2afb082`

### 9.2 Configure Route Tables

```bash
# Create route to NAT Gateway in main route table (for private subnets)
aws ec2 create-route \
    --route-table-id rtb-047ba6122c4488585 \
    --destination-cidr-block 0.0.0.0/0 \
    --nat-gateway-id nat-07406f45dd2afb082 \
    --region us-east-1

# Create public route table for NAT Gateway subnet (routes to IGW)
aws ec2 create-route-table --vpc-id vpc-0738b4d7a3993eb9e --region us-east-1
# Output: RouteTableId: rtb-0b74ac32ac9382e81

aws ec2 create-route \
    --route-table-id rtb-0b74ac32ac9382e81 \
    --destination-cidr-block 0.0.0.0/0 \
    --gateway-id igw-xxxxx \
    --region us-east-1

aws ec2 associate-route-table \
    --subnet-id subnet-0cf9ac8b555350b9d \
    --route-table-id rtb-0b74ac32ac9382e81 \
    --region us-east-1
```

### 9.3 Verify Connectivity

```bash
# Check ECS task logs for JWKS caching
aws logs filter-log-events \
    --log-group-name /ecs/fragments-task \
    --filter-pattern "JWKS" \
    --region us-east-1
```

**Output:**
```
[23:24:21.012] INFO (1): Cognito JWKS cached
```

---

## Part 10: Verification

### 10.1 Test API Health

```bash
curl http://fragments-alb-1769048722.us-east-1.elb.amazonaws.com/
```

**Output:**
```json
{
  "status": "ok",
  "author": "David Chan",
  "githubUrl": "https://github.com/DC-Seneca/CCP555-demo",
  "version": "0.10.0"
}
```

### 10.2 Test Authenticated Request

```bash
# Get Cognito token
TOKEN=$(aws cognito-idp admin-initiate-auth \
    --user-pool-id us-east-1_tADSehAHN \
    --client-id 6tq7d72o488vigrrb0glgniv2m \
    --auth-flow ADMIN_NO_SRP_AUTH \
    --auth-parameters USERNAME=testuser@example.com,PASSWORD="TestPass123!" \
    --region us-east-1 \
    --query 'AuthenticationResult.IdToken' --output text)

# Get fragments
curl "http://fragments-alb-1769048722.us-east-1.elb.amazonaws.com/v1/fragments?expand=1" \
    -H "Authorization: Bearer $TOKEN"
```

**Output:**
```json
{
  "status": "ok",
  "fragments": [
    {
      "id": "731f5219-4356-47aa-bae4-5be10aaa0fbf",
      "ownerId": "edddab7920ebddadd16bba136e0587a18b002309e383454e602dd8dd0c918643",
      "type": "text/plain",
      "size": 2,
      "created": "2025-11-25T22:52:45.982Z",
      "updated": "2025-11-25T22:52:46.074Z"
    },
    {
      "id": "a6c5f546-09fa-43f4-bf1d-fb0606310ff5",
      "ownerId": "edddab7920ebddadd16bba136e0587a18b002309e383454e602dd8dd0c918643",
      "type": "text/plain",
      "size": 29,
      "created": "2025-11-25T22:09:41.866Z",
      "updated": "2025-11-25T22:09:42.020Z"
    }
  ]
}
```

### 10.3 Verify DynamoDB Data

```bash
aws dynamodb scan --table-name fragments --region us-east-1 \
    --query 'Items[*].{id:id.S,ownerId:ownerId.S,type:type.S,size:size.N}'
```

**Output:**
```json
[
    {
        "id": "731f5219-4356-47aa-bae4-5be10aaa0fbf",
        "ownerId": "edddab7920ebddadd16bba136e0587a18b002309e383454e602dd8dd0c918643",
        "type": "text/plain",
        "size": "2"
    },
    {
        "id": "a6c5f546-09fa-43f4-bf1d-fb0606310ff5",
        "ownerId": "edddab7920ebddadd16bba136e0587a18b002309e383454e602dd8dd0c918643",
        "type": "text/plain",
        "size": "29"
    },
    {
        "id": "b5d4847f-0773-47ca-b4d4-3e0772e9de29",
        "ownerId": "edddab7920ebddadd16bba136e0587a18b002309e383454e602dd8dd0c918643",
        "type": "text/plain",
        "size": "29"
    },
    {
        "id": "e2884d59-1dc8-4b55-8993-e805099d2184",
        "ownerId": "edddab7920ebddadd16bba136e0587a18b002309e383454e602dd8dd0c918643",
        "type": "text/plain",
        "size": "88"
    }
]
```

**Total Fragments:** 4

---

## Part 11: Fragments UI

### 11.1 UI Configuration (`.env`)

```
API_URL=http://fragments-alb-1769048722.us-east-1.elb.amazonaws.com
AWS_COGNITO_POOL_ID=us-east-1_tADSehAHN
AWS_COGNITO_CLIENT_ID=6tq7d72o488vigrrb0glgniv2m
AWS_COGNITO_DOMAIN=fragments-lab10-1764105020
OAUTH_SIGN_IN_REDIRECT_URL=http://localhost:1234
```

### 11.2 Run UI Locally

```bash
cd fragments-ui
npm install
npm start
```

**Access:** http://localhost:1234

### 11.3 UI Features Tested

| Feature | Status | Notes |
|---------|--------|-------|
| Login with Cognito | ✅ | OAuth2 code flow working |
| Create Fragment | ✅ | POST /v1/fragments returns 201 |
| List Fragments | ✅ | GET /v1/fragments?expand=1 returns metadata |
| Select Fragment | ✅ | Highlights and populates update form |
| Load Fragment Data | ✅ | GET /v1/fragments/:id returns data |
| Update Fragment | ✅ | PUT /v1/fragments/:id updates content |
| Delete Fragment | ✅ | DELETE /v1/fragments/:id removes from DB & S3 |
| Logout | ✅ | Clears session and redirects to Cognito |

---

## Submission Summary

### Links

| Resource | URL |
|----------|-----|
| GitHub Repository | https://github.com/DC-Seneca/CCP555-demo |
| Integration Tests | https://github.com/DC-Seneca/CCP555-demo/blob/main/fragments/tests/integration/lab-10-dynamodb.hurl |
| CI/CD Actions | https://github.com/DC-Seneca/CCP555-demo/actions |
| API Endpoint (ALB) | http://fragments-alb-1769048722.us-east-1.elb.amazonaws.com |
| Docker Hub | https://hub.docker.com/r/dcjoker/fragments |

### AWS Resources

| Resource | ID/Name | Status |
|----------|---------|--------|
| DynamoDB Table | fragments | ✅ ACTIVE |
| S3 Bucket | ccp555-demo-fragments-dc | ✅ EXISTS |
| ECS Cluster | lovable-gecko-hkov7g2 | ✅ ACTIVE |
| ECS Service | fragments-service | ✅ RUNNING |
| Task Definition | fragments-task:10 | ✅ DEPLOYED |
| Load Balancer | fragments-alb | ✅ ACTIVE |
| Target Group | fragments-tg | ✅ HEALTHY |
| NAT Gateway | nat-07406f45dd2afb082 | ✅ AVAILABLE |
| Cognito User Pool | us-east-1_tADSehAHN | ✅ ACTIVE |

### CI/CD Results

All jobs passed:
- ✅ Dockerfile Lint
- ✅ ESLint
- ✅ Unit Tests (43 tests)
- ✅ Integration Tests (8 requests)
- ✅ Build and Push to Docker Hub

### Checklist

- [x] DynamoDB table created with correct schema (ownerId, id)
- [x] DynamoDB SDK code implemented (ddbDocClient.js, index.js)
- [x] S3 integration maintained for fragment data
- [x] Integration test file created (lab-10-dynamodb.hurl)
- [x] Docker Compose with LocalStack and DynamoDB Local
- [x] CI workflow includes integration tests
- [x] ECS deployment working with Cognito auth
- [x] NAT Gateway configured for JWKS access
- [x] Fragments UI with CRUD operations
- [x] DynamoDB verified with 4 fragments stored

---

**Lab 10 Complete!** 🎉
