# Lab 7 - Remaining Tasks Checklist

## ✅ What's Already Done

- ✅ Dockerfile created with health check
- ✅ CI workflow with 4 jobs (lint, dockerfile-lint, unit-tests, docker-hub)
- ✅ CD workflow created for AWS ECR
- ✅ Package.json version updated to 0.7.0
- ✅ GitHub Secrets configured (Docker Hub + AWS)
- ✅ AWS ECR repository created
- ✅ Code committed and pushed
- ✅ Version tag v0.7.0 created and pushed
- ✅ Workflows triggered (CI and CD)

---

## 📋 What's Left to Do

### 1. **Run Hadolint Locally (Optional but Recommended)**

**Purpose**: Verify Dockerfile has no issues before pushing

**Steps**:
```bash
cd "Lab 7"
docker run --rm -i hadolint/hadolint < Dockerfile
```

**Expected Output**: No output (empty = success, no errors)

**Screenshot**: Take a screenshot showing:
- The command you ran
- Empty output (or any warnings/errors if they exist)

**Note**: If you see warnings/errors, fix them and run again.

---

### 2. **Monitor CI Workflow (Wait for Completion)**

**Location**: https://github.com/Heetpatel219/CCP555-2025F-NSC-Heet-Patel-hhpatel31/actions

**Steps**:
1. Go to GitHub → Your Repository → **Actions** tab
2. Find the CI workflow that was triggered by your last push
3. Wait for all 4 jobs to complete:
   - ✅ ESLint
   - ✅ Dockerfile Lint
   - ✅ Unit Tests
   - ✅ Build and Push to Docker Hub

**Screenshot**: Take a screenshot showing:
- All 4 jobs with green checkmarks ✅
- Workflow name and commit information
- Execution time

**If Workflow Fails**: 
- Click on the failed job to see error messages
- Fix any issues and push again

---

### 3. **Verify Docker Hub Images**

**Location**: https://hub.docker.com/

**Steps**:
1. Go to Docker Hub → Your repository: `{your-username}/fragments`
2. Click on the repository
3. Go to **Tags** tab
4. Verify you see these tags:
   - `main` - Latest build from main branch
   - `latest` - Latest successful build
   - `sha-{commit-hash}` - Specific commit build

**Screenshot**: Take a screenshot showing:
- Repository name: `{your-username}/fragments`
- Tags tab with at least 3 tags visible
- Image sizes and push timestamps

---

### 4. **Monitor CD Workflow (Wait for Completion)**

**Location**: https://github.com/Heetpatel219/CCP555-2025F-NSC-Heet-Patel-hhpatel31/actions

**Steps**:
1. Go to GitHub → Your Repository → **Actions** tab
2. Find the **CD** workflow (not CI)
3. It should be triggered by tag `v0.7.0`
4. Wait for all steps to complete:
   - ✅ Check out code
   - ✅ Set up Docker Buildx
   - ✅ Configure AWS Credentials
   - ✅ Login to Amazon ECR
   - ✅ Build and push to Amazon ECR

**Screenshot**: Take a screenshot showing:
- CD workflow with all steps passing ✅
- Triggered by: tag `v0.7.0`
- All steps showing green checkmarks

**If Workflow Fails**:
- Check if AWS credentials are expired (Learner Lab credentials expire)
- Update GitHub Secrets with new AWS credentials if needed
- Re-run the workflow or create a new tag

---

### 5. **Verify AWS ECR Images**

**Location**: AWS Console → ECR → Repositories

**Steps**:
1. Go to AWS Console
2. Navigate to **ECR** (Elastic Container Registry)
3. Click on your repository: `ccp555-2025f/lab7-demo`
4. Go to **Images** section
5. Verify you see images with tags:
   - `v0.7.0` - Version tag from git
   - `latest` - Latest release

**Screenshot**: Take a screenshot showing:
- AWS ECR Console
- Repository: `ccp555-2025f/lab7-demo`
- Images table showing `v0.7.0` and `latest` tags
- Push timestamps and image sizes

---

### 6. **Test Docker Hub Image Locally**

**Purpose**: Verify the Docker Hub image works on your local machine

**Steps**:
```bash
# Pull the image from Docker Hub
docker pull {your-dockerhub-username}/fragments:main

# Run the container
docker run -d -p 8080:8080 --name fragments-test {your-dockerhub-username}/fragments:main

# Test health check endpoint
curl http://localhost:8080/

# Expected response:
# {
#   "status": "ok",
#   "author": "Heet Patel",
#   "githubUrl": "...",
#   "version": "0.7.0"
# }

# Clean up
docker stop fragments-test
docker rm fragments-test
```

**Note**: The application may require AWS Cognito environment variables. If the container exits, that's expected - the image itself is working.

**Screenshot**: Take a screenshot showing:
- Terminal with `docker pull` command
- `docker run` command
- `curl` command and JSON response
- Response showing `status: "ok"` and `version: "0.7.0"`

---

### 7. **Test AWS ECR Image on EC2 (Optional)**

**Purpose**: Verify the ECR image works on an EC2 instance

**Prerequisites**:
- Running EC2 instance with Docker installed
- AWS CLI configured
- Security group allows port 8080

**Steps** (on EC2 instance):
```bash
# Set AWS credentials (from Learner Lab)
export AWS_ACCESS_KEY_ID={your-access-key}
export AWS_SECRET_ACCESS_KEY={your-secret-key}
export AWS_SESSION_TOKEN={your-session-token}
export AWS_DEFAULT_REGION=us-east-1

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  992382586628.dkr.ecr.us-east-1.amazonaws.com

# Pull the image
docker pull 992382586628.dkr.ecr.us-east-1.amazonaws.com/ccp555-2025f/lab7-demo:v0.7.0

# Run the container
docker run -d -p 8080:8080 \
  992382586628.dkr.ecr.us-east-1.amazonaws.com/ccp555-2025f/lab7-demo:v0.7.0

# Test health check
curl http://localhost:8080/
```

**Screenshot**: Take a screenshot showing:
- EC2 terminal with `aws ecr get-login-password` command
- `docker pull` command
- `docker run` command
- `curl` response showing application running

---

## 📸 Required Screenshots Summary

Based on lab instructions, you need **7 screenshots**:

1. ✅ **Hadolint local run** - Terminal showing hadolint command with no errors
2. ✅ **CI Workflow success** - GitHub Actions showing all 4 jobs passing
3. ✅ **Docker Hub tags** - Docker Hub showing main, latest, and sha-* tags
4. ✅ **CD Workflow success** - GitHub Actions showing CD workflow passing
5. ✅ **AWS ECR images** - AWS Console showing ECR repository with v0.7.0 and latest tags
6. ✅ **Local Docker Hub test** - Terminal showing docker pull, run, and curl response
7. ✅ **EC2 ECR test** - EC2 terminal showing ECR login, pull, run, and curl response

---

## 🎯 Quick Status Check

**Check Your Workflows**:
- GitHub Actions: https://github.com/Heetpatel219/CCP555-2025F-NSC-Heet-Patel-hhpatel31/actions

**Check Docker Hub**:
- https://hub.docker.com/repository/docker/{your-username}/fragments

**Check AWS ECR**:
- AWS Console → ECR → Repositories → `ccp555-2025f/lab7-demo`

---

## ⚠️ Common Issues

### CI Workflow Fails
- Check GitHub Secrets are set correctly
- Verify Docker Hub username and token
- Check GitHub Actions logs for specific errors

### CD Workflow Fails
- AWS credentials may be expired (update GitHub Secrets)
- ECR repository may not exist (create it)
- Check AWS region is `us-east-1`

### Docker Image Won't Run
- Application requires AWS Cognito environment variables
- This is expected behavior - the image itself is working

---

## ✅ Completion Checklist

- [ ] Hadolint run locally (screenshot taken)
- [ ] CI workflow completed successfully (screenshot taken)
- [ ] Docker Hub images verified (screenshot taken)
- [ ] CD workflow completed successfully (screenshot taken)
- [ ] AWS ECR images verified (screenshot taken)
- [ ] Docker Hub image tested locally (screenshot taken)
- [ ] ECR image tested on EC2 (screenshot taken - optional)

---

**Good luck! 🚀**

