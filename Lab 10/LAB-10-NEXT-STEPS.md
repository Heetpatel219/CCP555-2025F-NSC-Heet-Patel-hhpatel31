# Lab 10 - Next Steps and Screenshot Guide

## Overview
This guide will help you complete Lab 10 and capture all required screenshots for submission.

---

## Step 1: Test Locally with Docker Compose

### 1.1 Start Docker Desktop
Make sure Docker Desktop is running on your machine.

### 1.2 Start Local Services
Open a terminal in the `Lab 10` directory and run:

```bash
cd Lab 10
docker compose up --build -d
```

**Wait for containers to start** (about 10-30 seconds).

### 1.3 Setup Local AWS Resources

**On Windows (PowerShell):**
```powershell
cd Lab 10
.\scripts\local-aws-setup.ps1
```

**On Linux/Mac:**
```bash
cd Lab 10
chmod +x ./scripts/local-aws-setup.sh
./scripts/local-aws-setup.sh
```

This will:
- Create S3 bucket `fragments` in LocalStack
- Create DynamoDB table `fragments` in DynamoDB Local

### 1.4 Run Integration Tests

```bash
cd Lab 10
npm run test:integration
```

**Expected Output:**
```
tests/integration/lab-10-dynamodb.hurl: Running [1/1]
tests/integration/lab-10-dynamodb.hurl: Success (8 request(s) in XXX ms)
--------------------------------------------------------------------------------
Executed files:  1
Succeeded files: 1 (100.0%)
Failed files:    0 (0.0%)
Duration:        XXX ms
```

### 📸 Screenshot 1: Integration Test Passing Locally
**What to capture:**
- Terminal showing `docker compose up --build -d` command
- Terminal showing `local-aws-setup` script running
- Terminal showing `npm run test:integration` with **SUCCESS** output
- Show all 8 tests passing

**Tips:**
- Use a terminal with good contrast
- Make sure the success message is visible
- Include the command prompts to show what you ran

---

## Step 2: Push Code and Run CI Workflow

### 2.1 Commit and Push Your Changes

```bash
cd Lab 10
git add .
git commit -m "Add DynamoDB support for Lab 10"
git push origin main
```

### 2.2 Monitor GitHub Actions

1. Go to your GitHub repository
2. Click on the **Actions** tab
3. Wait for the CI workflow to complete

**Expected Jobs:**
- ✅ ESLint
- ✅ Dockerfile Lint
- ✅ Unit Tests
- ✅ Integration Tests (NEW!)
- ✅ Build and Push to Docker Hub

### 📸 Screenshot 2: CI Workflow Passing
**What to capture:**
- GitHub Actions page showing all jobs
- All jobs with green checkmarks ✅
- Specifically highlight the **Integration Tests** job showing it passed
- Show the workflow run details

**Tips:**
- Use browser zoom to fit everything in one screenshot
- Make sure the Integration Tests job is visible
- Show the duration/time for each job

---

## Step 3: Create DynamoDB Table in AWS

### 3.1 Access AWS Console

1. Go to AWS Academy Learner Lab
2. Start your lab session
3. Open AWS Console
4. Search for **DynamoDB**

### 3.2 Create Table

1. Click **Create table**
2. **Table name:** `fragments`
3. **Partition key:** `ownerId` (String)
4. **Sort key:** `id` (String)
5. Leave other settings as **Default**
6. Click **Create table**

**Wait for table status to be "Active"** (about 30 seconds)

### 3.3 Verify Table

- Table should show status: **Active**
- Table ARN should be visible
- Note your table name: `fragments`

---

## Step 4: Update GitHub Secrets

### 4.1 Get AWS Credentials

From AWS Academy Learner Lab:
1. Click **AWS Details**
2. Click **AWS CLI** button
3. Copy your credentials:
   - `aws_access_key_id`
   - `aws_secret_access_key`
   - `aws_session_token`

### 4.2 Update GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Update these secrets:
   - `AWS_ACCESS_KEY_ID` → Your access key ID
   - `AWS_SECRET_ACCESS_KEY` → Your secret access key
   - `AWS_SESSION_TOKEN` → Your session token
   - `AWS_S3_BUCKET_NAME` → `hhpatel31-fragments` (or your bucket name)

---

## Step 5: Deploy to ECS

### 5.1 Create ECR Repository (if needed)

The CD workflow will create it automatically, but you can verify:

```bash
aws ecr describe-repositories --repository-names ccp555-2025f/lab10-demo --region us-east-1
```

If it doesn't exist, create it:
```bash
aws ecr create-repository --repository-name ccp555-2025f/lab10-demo --region us-east-1
```

### 5.2 Tag and Push

```bash
cd Lab 10
npm version 0.10.0
git add package.json package-lock.json
git commit -m "Release Lab 10 with DynamoDB support"
git push origin main
git tag v0.10.0
git push origin v0.10.0
```

### 5.3 Monitor Deployment

1. Go to GitHub Actions
2. Watch the **CD Lab 10** workflow
3. Wait for deployment to complete (about 5-10 minutes)

**Expected:**
- ✅ Build and push to ECR
- ✅ Deploy to ECS
- ✅ Verify deployment

---

## Step 6: Test with fragments-ui

### 6.1 Get Your ECS Application URL

From AWS Console:
1. Go to **ECS** → **Clusters** → `default`
2. Click on **Services** → `fragemnts-cluster`
3. Find the **Application URL** (e.g., `fr-xxxxx.ecs.us-east-1.on.aws`)

### 6.2 Configure fragments-ui

1. Open `fragments-ui` project (if you have it)
2. Update `.env` or configuration:
   ```
   API_URL=http://fr-xxxxx.ecs.us-east-1.on.aws
   ```
   (Replace with your actual ECS URL)

3. Start the UI:
   ```bash
   cd fragments-ui
   npm start
   ```

### 6.3 Create a Fragment

1. Open browser to `http://localhost:1234` (or your UI port)
2. Login (if using Cognito) or use Basic Auth
3. Create a new fragment:
   - Type: `text/plain`
   - Content: `Hello DynamoDB!`
   - Click **Create**

### 📸 Screenshot 3: fragments-ui Creating Fragment
**What to capture:**
- Browser showing fragments-ui
- The fragment creation form/interface
- **Network tab** open showing the API request
- Network request details showing:
  - **Request URL:** Your ECS URL (e.g., `http://fr-xxxxx.ecs.us-east-1.on.aws/v1/fragments`)
  - **Request Method:** POST
  - **Status Code:** 201 Created
  - **Response:** Fragment data

**Tips:**
- Use Chrome DevTools (F12)
- Go to **Network** tab
- Filter by "fragments" or your API URL
- Click on the POST request to show details
- Make sure the ECS URL is visible in the request

---

## Step 7: Verify DynamoDB Item

### 7.1 View Fragment in DynamoDB

1. Go to AWS Console → **DynamoDB**
2. Click **Tables** → `fragments`
3. Click **Explore table items**
4. You should see your fragment as an item

### 7.2 View Item Details

1. Click on the item (or checkbox)
2. Click **View item** or expand the item
3. You should see:
   - `ownerId` (partition key)
   - `id` (sort key)
   - `type` (e.g., "text/plain")
   - `size` (number)
   - `created` (timestamp string)
   - `updated` (timestamp string)

### 📸 Screenshot 4: DynamoDB Console Showing Fragment
**What to capture:**
- AWS DynamoDB Console
- Table name `fragments` visible
- **Items** tab showing your fragment
- Item details expanded showing:
  - `ownerId`
  - `id`
  - `type`
  - `size`
  - `created`
  - `updated`

**Tips:**
- Use **JSON** view for cleaner display
- Make sure all attributes are visible
- Show the table name in the breadcrumb/navigation

---

## Step 8: Get GitHub Link

### 8.1 Get Integration Test File Link

1. Go to your GitHub repository
2. Navigate to: `Lab 10/tests/integration/lab-10-dynamodb.hurl`
3. Click on the file
4. Copy the URL from your browser

**Example URL format:**
```
https://github.com/Heetpatel219/CCP555-2025F-NSC-Heet-Patel-hhpatel31/blob/main/Lab%2010/tests/integration/lab-10-dynamodb.hurl
```

---

## Troubleshooting

### Integration Tests Failing Locally

**Check containers are running:**
```bash
docker ps
```

**Check logs:**
```bash
docker logs lab10-fragments-1
docker logs lab10-localstack-1
docker logs lab10-dynamodb-local-1
```

**Restart containers:**
```bash
docker compose down
docker compose up --build -d
./scripts/local-aws-setup.sh  # or .ps1
```

### CI Integration Tests Failing

**Check GitHub Actions logs:**
- Look for error messages in the Integration Tests job
- Common issues:
  - Containers not starting
  - AWS setup script failing
  - Port conflicts

**Fix:**
- Make sure `local-aws-setup.sh` is executable (chmod +x)
- Check docker-compose.yml paths
- Verify all environment variables are set

### ECS Deployment Failing

**Check CloudWatch Logs:**
```bash
aws logs tail /ecs/fragments --follow --region us-east-1
```

**Check ECS Service:**
```bash
aws ecs describe-services --cluster default --services fragemnts-cluster --region us-east-1
```

**Common issues:**
- Missing DynamoDB table (create it first!)
- Missing S3 bucket (should already exist from Lab 9)
- IAM role permissions (LabRole should have DynamoDB access)

### DynamoDB Item Not Showing

**Wait a few seconds** - DynamoDB is eventually consistent

**Check CloudWatch Logs** for errors:
```bash
aws logs tail /ecs/fragments --since 10m --region us-east-1
```

**Verify table name** matches in:
- ECS task definition: `AWS_DYNAMODB_TABLE_NAME=fragments`
- DynamoDB Console: Table name `fragments`

---

## Checklist

- [ ] Integration test passes locally
- [ ] CI workflow passes (including integration tests)
- [ ] DynamoDB table created in AWS
- [ ] GitHub secrets updated
- [ ] Code pushed and tagged (v0.10.0)
- [ ] ECS deployment successful
- [ ] fragments-ui can create fragments
- [ ] DynamoDB shows fragment items
- [ ] All 4 screenshots captured
- [ ] GitHub link to integration test file

---

## Quick Command Reference

```bash
# Local testing
cd Lab 10
docker compose up --build -d
./scripts/local-aws-setup.sh  # or .ps1
npm run test:integration

# Deploy
npm version 0.10.0
git add .
git commit -m "Release Lab 10"
git push origin main
git push origin v0.10.0

# Check ECS logs
aws logs tail /ecs/fragments --follow --region us-east-1

# Check DynamoDB items
aws dynamodb scan --table-name fragments --region us-east-1
```

---

Good luck! 🚀

