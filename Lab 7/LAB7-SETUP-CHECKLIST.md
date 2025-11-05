# Lab 7 - Setup Checklist

## ✅ What's Already Done (by AI)

- ✅ Dockerfile created with health check and best practices
- ✅ CI workflow configured with 4 jobs (lint, dockerfile-lint, unit-tests, docker-hub)
- ✅ CD workflow created for AWS ECR deployment
- ✅ Package.json version updated to 0.7.0
- ✅ Routes updated to use version from package.json
- ✅ All code files are ready

---

## 📋 What You Need to Do

### Step 1: Set Up Docker Hub Secrets

1. **Create Docker Hub Account** (if you don't have one)
   - Go to https://hub.docker.com/
   - Sign up or log in

2. **Create Docker Hub Personal Access Token**
   - Go to Docker Hub → Account Settings → Security
   - Click "New Access Token"
   - Name it: `github-actions` (or any name)
   - Copy the token (you'll only see it once!)
   - **⚠️ DO NOT paste your token in this file!** Only add it as a GitHub Secret.

3. **Add GitHub Secrets for Docker Hub**
   - Go to your GitHub repository: `https://github.com/Heetpatel219/CCP555-2025F-NSC-Heet-Patel-hhpatel31`
   - Click **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Add these two secrets:
     - **Name**: `DOCKERHUB_USERNAME`
       **Value**: Your Docker Hub username
     - **Name**: `DOCKERHUB_TOKEN`
       **Value**: Your Docker Hub Personal Access Token

---

### Step 2: Set Up AWS ECR Repository

1. **Log in to AWS Console**
   - Go to https://console.aws.amazon.com/
   - Sign in with your AWS Learner Lab credentials

2. **Create ECR Repository**
   - Go to **ECR** (Elastic Container Registry) service
   - Click **Create repository**
   - **Visibility settings**: Private
   - **Repository name**: `ccp555-2025f/lab7-demo`
   - **Tag immutability**: Disabled (optional)
   - Click **Create repository**

3. **Note the Repository URI**
   - It will look like: `590184105859.dkr.ecr.us-east-1.amazonaws.com/ccp555-2025f/lab7-demo`
   - The account ID (590184105859) is your AWS Account ID
   - The repository name is `ccp555-2025f/lab7-demo`

---

### Step 3: Get AWS Credentials

1. **From AWS Learner Lab - Where to Find Credentials**

   **Option A: AWS Learner Lab Dashboard (Recommended)**
   - Log in to AWS Academy/AWS Learner Lab
   - In the **"Cloud Access"** section, find **"AWS CLI"**
   - Click the **"Show"** button next to AWS CLI
   - This will reveal your AWS credentials in a format like:
     ```ini
     [default]
     aws_access_key_id=ASIA...
     aws_secret_access_key=...
     aws_session_token=...
     ```
   - Copy all three values (you'll see them displayed)
   
   **⚠️ IMPORTANT: DO NOT COPY YOUR ACTUAL CREDENTIALS INTO THIS FILE!** 
   - Only add them as GitHub Secrets, never commit them to the repository.
    
   **Option B: AWS Console (CloudShell)**
   - In AWS Console, open **CloudShell** (top right icon)
   - Run this command to get your credentials:
     ```bash
     aws configure list
     ```
   - Or check the credentials file:
     ```bash
     cat ~/.aws/credentials
     ```
   - You should see something like:
     ```ini
     [default]
     aws_access_key_id=ASIA...
     aws_secret_access_key=...
     aws_session_token=...
     ```

   **Option C: AWS Console (IAM User)**
   - Go to **AWS Console** → **IAM** → **Users**
   - Click on your user → **Security credentials** tab
   - Look for **"Access keys"** section
   - Note: Learner Lab may use temporary credentials, so check the Learner Lab dashboard first

   **What the credentials look like:**
   ```ini
   [default]
   aws_access_key_id=ASIAYS2NWY6BRZSPZYCB
   aws_secret_access_key=7OBY0FQP8gbawFoJibNTm018XRNl9MgerOv0Mrrl
   aws_session_token=IQoJb3JpZ2luX2VjEFAaCXV1LXJlZi1EQVFBa0FHSUh... (long token)
   ```

2. **Add GitHub Secrets for AWS**
   - Go to your GitHub repository: `https://github.com/Heetpatel219/CCP555-2025F-NSC-Heet-Patel-hhpatel31`
   - Click **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Add these three secrets (copy the values from your AWS credentials):
     - **Name**: `AWS_ACCESS_KEY_ID`
       **Value**: Copy the value after `aws_access_key_id=` (e.g., `ASIAYS2NWY6BRZSPZYCB`)
     - **Name**: `AWS_SECRET_ACCESS_KEY`
       **Value**: Copy the value after `aws_secret_access_key=` (the long string)
     - **Name**: `AWS_SESSION_TOKEN`
       **Value**: Copy the value after `aws_session_token=` (the very long token string)

   **⚠️ Important**: 
   - AWS Learner Lab credentials are **temporary** and expire when the session ends
   - You'll need to update these GitHub secrets when you start a new Learner Lab session
   - The session token is especially long - make sure you copy the entire token

---

### Step 4: Commit and Push Your Code

1. **Stage all changes**
   ```bash
   git add Lab\ 7/
   ```

2. **Commit the changes**
   ```bash
   git commit -m "Lab 7: Add CI/CD workflows with Docker Hub and AWS ECR integration"
   ```

3. **Push to GitHub**
   ```bash
   git push origin main
   ```

   **This will trigger the CI workflow!** 🎉

---

### Step 5: Test the CI Workflow

1. **Monitor the CI Workflow**
   - Go to your GitHub repository
   - Click **Actions** tab
   - You should see the CI workflow running
   - Wait for all 4 jobs to complete:
     - ✅ ESLint
     - ✅ Dockerfile Lint
     - ✅ Unit Tests
     - ✅ Build and Push to Docker Hub

2. **Verify Docker Hub Image**
   - Go to https://hub.docker.com/
   - Navigate to your repository: `{your-username}/fragments`
   - You should see tags: `main`, `latest`, and `sha-{commit-hash}`
   - This confirms the CI workflow worked! ✅

---

### Step 6: Test the CD Workflow (Deploy to AWS ECR)

1. **Create a Version Tag**
   ```bash
   # Make sure you're on the latest commit
   git pull origin main
   
   # Create version tag
   git tag v0.7.0
   
   # Push the tag to GitHub
   git push origin v0.7.0
   ```

   **This will trigger the CD workflow!** 🚀

2. **Monitor the CD Workflow**
   - Go to GitHub repository → **Actions** tab
   - You should see the CD workflow running
   - Wait for the AWS job to complete:
     - ✅ Check out code
     - ✅ Set up Docker Buildx
     - ✅ Configure AWS Credentials
     - ✅ Login to Amazon ECR
     - ✅ Build and push to Amazon ECR

3. **Verify AWS ECR Image**
   - Go to AWS Console → **ECR** → **Repositories** → `ccp555-2025f/lab7-demo`
   - You should see images with tags:
     - `v0.7.0` (version tag)
     - `latest` (latest release)
   - This confirms the CD workflow worked! ✅

---

### Step 7: Optional - Test Images Locally

#### Test Docker Hub Image
```bash
# Pull the image
docker pull {your-dockerhub-username}/fragments:main

# Run the container
docker run -d -p 8080:8080 --name fragments-test {your-dockerhub-username}/fragments:main

# Test health check
curl http://localhost:8080/

# Clean up
docker stop fragments-test
docker rm fragments-test
```

#### Test AWS ECR Image (on EC2 or local with AWS credentials)
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  {your-account-id}.dkr.ecr.us-east-1.amazonaws.com

# Pull the image
docker pull {your-account-id}.dkr.ecr.us-east-1.amazonaws.com/ccp555-2025f/lab7-demo:v0.7.0

# Run the container
docker run -d -p 8080:8080 \
  {your-account-id}.dkr.ecr.us-east-1.amazonaws.com/ccp555-2025f/lab7-demo:v0.7.0

# Test health check
curl http://localhost:8080/
```

---

## 🎯 Quick Reference

### Required GitHub Secrets
- `DOCKERHUB_USERNAME` - Your Docker Hub username
- `DOCKERHUB_TOKEN` - Docker Hub Personal Access Token
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_SESSION_TOKEN` - AWS session token (if using temporary credentials)

### Workflow Triggers
- **CI Workflow**: Triggers on push to `main` or `master` branch
- **CD Workflow**: Triggers on tag push matching `v**` pattern (e.g., `v0.7.0`)

### Repository Names
- **Docker Hub**: `{your-username}/fragments`
- **AWS ECR**: `ccp555-2025f/lab7-demo`

---

## ❓ Troubleshooting

### CI Workflow Fails
- Check if all secrets are set correctly
- Verify Docker Hub username and token are correct
- Check GitHub Actions logs for specific error messages

### CD Workflow Fails
- Verify AWS credentials are valid (not expired)
- Check if ECR repository exists: `ccp555-2025f/lab7-demo`
- Verify AWS region is set to `us-east-1`
- Check if you have permission to push to ECR

### Docker Image Won't Run
- The application requires AWS Cognito environment variables for full functionality
- Without them, the container will exit (this is expected)
- For testing, you can run with mocked authentication

---

## ✅ Success Criteria

Your Lab 7 is complete when:

- ✅ CI workflow runs successfully with all 4 jobs passing
- ✅ Docker Hub image is pushed with tags: `main`, `latest`, `sha-{hash}`
- ✅ CD workflow runs successfully when you push tag `v0.7.0`
- ✅ AWS ECR image is pushed with tags: `v0.7.0`, `latest`
- ✅ You can pull and run images from both Docker Hub and AWS ECR

---

**Good luck! 🚀**

