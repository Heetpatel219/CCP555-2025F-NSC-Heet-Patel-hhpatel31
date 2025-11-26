# Lab 9 - AWS S3 Integration - Remaining Steps

This document contains instructions for the manual steps that need to be completed, as well as guidance for taking the required screenshots.

## ✅ Completed Automatically

The following have been completed:
- ✅ Installed `@aws-sdk/client-s3` package
- ✅ Created AWS data model structure (`src/model/data/aws/`)
- ✅ Created S3 client configuration (`src/model/data/aws/s3Client.js`)
- ✅ Implemented S3 integration for `writeFragmentData`, `readFragmentData`, and `deleteFragmentData`
- ✅ Updated data model selection logic to use AWS backend when `AWS_REGION` is set
- ✅ Created DELETE route handler (`src/routes/api/v1/delete.js`)
- ✅ Created integration test (`tests/integration/lab-9-s3.hurl`)

## 📋 Manual Steps Required

### Step 1: Create an S3 Bucket in AWS Console

1. Start the AWS Academy Learner Lab environment
2. Open the AWS Console
3. Search for "S3" in the services list
4. Click "Create bucket"
5. Choose a bucket name (must be unique, 3-63 characters)
   - Format: `<seneca-username>-fragments`
   - Example: `hhpatel31-fragments`
6. Select region: `us-east-1`
7. For Object Ownership: Select "ACLs disabled (recommended)"
8. Block all public access: ✅ Enabled (checked)
9. Bucket Versioning: Disabled
10. Encryption: Use default Amazon S3 managed keys
11. Click "Create bucket"

**Screenshot Opportunity**: Take a screenshot showing your bucket in the S3 console after creation.

### Step 2: Manually Upload a File

1. Click on your bucket name
2. Click "Upload"
3. Click "Add files" and choose any file (text file, image, etc.)
4. Click "Upload"
5. Note the Destination URI (e.g., `s3://hhpatel31-fragments/filename.txt`)
6. Confirm the file appears in your bucket

**Screenshot Opportunity**: Take a screenshot showing the uploaded file in your bucket.

### Step 3: Using AWS S3 CLI

1. Go to the AWS Learner Lab web page
2. Open the AWS Terminal
3. Run: `aws s3 ls`
   - Should show your bucket in the list
4. List bucket contents: `aws s3 ls <your-bucket-name>`
   - Example: `aws s3 ls hhpatel31-fragments`
5. Delete the test file: `aws s3 rm s3://<bucket-name>/<filename>`
   - Example: `aws s3 rm s3://hhpatel31-fragments/filename.txt`

**Screenshot Opportunity**: Take a screenshot showing the CLI commands and their output.

### Step 4: Test Integration Test Locally with LocalStack

1. Navigate to the Lab 9 directory:
   ```powershell
   cd "Lab 9"
   ```

2. Start Docker containers (rebuild fragments image):
   ```powershell
   docker compose up --build -d
   ```

3. Run the LocalStack setup script:
   ```powershell
   .\scripts\local-aws-setup.sh
   ```
   Or if using PowerShell, you may need to run:
   ```powershell
   bash scripts/local-aws-setup.sh
   ```

4. In another terminal, stream logs from fragments container:
   ```powershell
   docker ps
   docker logs -f <CONTAINER_ID>
   ```

5. In another terminal, run the integration test:
   ```powershell
   cd "Lab 9"
   npm run test:integration
   ```

6. If the test fails, rebuild just the fragments container:
   ```powershell
   docker compose up --build --no-deps -d fragments
   ```

7. When done testing, stop containers:
   ```powershell
   docker compose down
   ```

**Screenshot Opportunity**: Take a screenshot showing:
- Terminal running `npm run test:integration`
- The test output showing `tests/integration/lab-9-s3.hurl: SUCCESS`
- The docker logs terminal showing the server processing requests

### Step 5: Configure ECS Task Definition

1. Find your `fragments-definition.json` file (may be in `.github/workflows/` or root directory)

2. Update the `taskRoleArn` to use your LabRole:
   ```json
   {
     "executionRoleArn": "arn:aws:iam::<YOUR_ACCOUNT_ID>:role/LabRole",
     "taskRoleArn": "arn:aws:iam::<YOUR_ACCOUNT_ID>:role/LabRole",
     ...
   }
   ```
   Replace `<YOUR_ACCOUNT_ID>` with your actual AWS account ID.

3. Add `AWS_S3_BUCKET_NAME` environment variable to the task definition:
   ```json
   "environment": [
     {
       "name": "AWS_S3_BUCKET_NAME",
       "value": "<your-bucket-name>"
     },
     ...
   ]
   ```

4. Update your GitHub Actions workflow (`.github/workflows/cd.yml`) to remove AWS credentials from environment variables:
   - Remove `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`
   - Keep other environment variables like `LOG_LEVEL`, `NODE_ENV`, `AWS_COGNITO_*`, etc.

### Step 6: Deploy to AWS ECS

1. Update your local git repo:
   ```powershell
   git add .
   git commit -m "Add S3 integration for fragments"
   git push origin main
   ```

2. Create a new version tag:
   ```powershell
   npm version 0.9.0
   ```

3. Update GitHub Actions Secrets (if needed):
   - Go to your GitHub repo → Settings → Secrets → Actions
   - Update `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN` with current Learner Lab credentials
   - Get these from AWS Learner Lab → AWS Details → AWS CLI button

4. Push the tag to trigger deployment:
   ```powershell
   git push origin main --tags
   ```

5. Monitor the deployment:
   - Go to GitHub → Actions tab
   - Watch the workflow run
   - Fix any issues and create patch versions (`npm version patch`) if needed

**Screenshot Opportunity**: Take a screenshot showing:
- GitHub Actions workflow running successfully
- The deployment completing without errors

### Step 7: Test with fragments-ui

1. Update your `fragments-ui` to use the ECS Load Balancer URL:
   - Find your ECS Load Balancer URL from AWS Console → EC2 → Load Balancers
   - Update `API_URL` in fragments-ui configuration

2. Run fragments-ui locally:
   ```powershell
   cd fragments-ui
   npm start
   ```

3. Create a new fragment through the UI

**Screenshot Opportunity**: Take a screenshot showing:
- Browser DevTools → Network tab
- A POST request to your ECS Load Balancer URL
- The fragment creation request/response

### Step 8: Verify Fragment in S3

1. Go to AWS Console → S3
2. Open your bucket
3. Look for the fragment object with key format: `<ownerId>/<fragment-id>`
   - Example: `63258595765642a14e8a725a22b18eab2ae02882a1e13525c6f500532eaa31f5/524RQdhMzifPRhlKI1G-V`

**Screenshot Opportunity**: Take a screenshot showing:
- Your S3 bucket open
- The fragment object visible with the correct key format

## 📸 Screenshot Requirements

You need to provide the following screenshots:

### 1. Integration Test Passing
**What to capture:**
- Terminal window showing `npm run test:integration` command
- Output showing `tests/integration/lab-9-s3.hurl: SUCCESS`
- Docker logs terminal showing server processing requests (optional but helpful)

**How to take:**
- Open PowerShell/terminal
- Run the test command
- Use Windows Snipping Tool (Win + Shift + S) or Print Screen
- Crop to show relevant terminal output

### 2. fragments-ui Creating Fragment via ECS
**What to capture:**
- Browser with fragments-ui open
- Browser DevTools → Network tab open
- A POST request to your ECS Load Balancer URL
- Request/Response details showing successful fragment creation

**How to take:**
1. Open fragments-ui in browser
2. Press F12 to open DevTools
3. Go to Network tab
4. Create a fragment
5. Click on the POST request
6. Take screenshot showing:
   - Request URL (should be your ECS Load Balancer)
   - Request Headers
   - Response status (201 Created)

### 3. S3 Console Showing Fragment Object
**What to capture:**
- AWS S3 Console open
- Your bucket selected
- Fragment object visible with key format: `<ownerId>/<fragment-id>`
- Object details (size, last modified, etc.)

**How to take:**
1. Go to AWS Console → S3
2. Click on your bucket name
3. Find the fragment object (may need to navigate folders)
4. Take screenshot showing the object in the list

### 4. (Optional) MinIO Console
**What to capture:**
- MinIO web console open at http://localhost:9001
- Bucket created
- File uploaded to bucket

**How to take:**
1. Follow optional MinIO setup steps (see below)
2. Open browser to http://localhost:9001
3. Login with MinIO credentials
4. Take screenshot showing bucket and objects

## 🔧 Optional: MinIO Setup

If you want to set up MinIO for local development:

1. Create `docker-compose.local.yml` in Lab 9 directory (already created if you followed the lab)

2. Start MinIO:
   ```powershell
   docker compose -f docker-compose.local.yml up -d
   ```

3. Access MinIO console at http://localhost:9001
   - Username: `minio-access-key`
   - Password: `minio-secret-key`

4. Create a bucket named `fragments`

5. Test uploading a file

6. Check `minio/data` directory on your host to see persisted data

7. Add `minio/` to `.gitignore` (already done)

## 🐛 Troubleshooting

### Integration Test Fails
- Check that LocalStack is running: `docker ps` should show localstack container
- Check that bucket was created: Run `local-aws-setup.sh` again
- Check server logs: `docker logs -f <container-id>`
- Verify environment variables are set correctly in `docker-compose.yml`

### S3 Operations Fail
- Verify `AWS_S3_BUCKET_NAME` environment variable is set
- Check that `AWS_REGION` is set (should be `us-east-1`)
- For LocalStack: Verify `AWS_S3_ENDPOINT_URL=http://localstack:4566`
- Check S3 client logs for detailed error messages

### ECS Deployment Fails
- Verify `taskRoleArn` is set correctly in `fragments-definition.json`
- Check that bucket name is correct in environment variables
- Verify IAM role has S3 permissions
- Check CloudWatch logs for ECS tasks

### Fragment Not Appearing in S3
- Check that `AWS_REGION` is set in ECS task definition
- Verify bucket name matches exactly
- Check CloudWatch logs for errors
- Verify IAM role has `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject` permissions

## 📝 Notes

- The current implementation uses MemoryDB for fragment metadata (until DynamoDB is added in a future lab)
- Fragment data is stored in S3 with key format: `<ownerId>/<fragment-id>`
- The `Fragment.byId()` method currently searches through all fragments in MemoryDB, which is inefficient but works for now
- When `AWS_REGION` environment variable is set, the system automatically uses AWS backend (S3)
- When `AWS_REGION` is not set, the system uses in-memory backend

## ✅ Submission Checklist

- [ ] Link to `tests/integration/lab-9-s3.hurl` in your GitHub repo
- [ ] Screenshot of integration test passing with LocalStack
- [ ] Screenshot of fragments-ui creating fragment via ECS
- [ ] Screenshot of S3 Console showing fragment object
- [ ] (Optional) Screenshot of MinIO console

## 🔗 Useful Links

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/)
- [LocalStack Documentation](https://docs.localstack.cloud/)
- [Hurl Documentation](https://hurl.dev/)

