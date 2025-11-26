# How to Trigger ECR/ECS Deployment

## Why You're Only Seeing ESLint and Unit Tests

The GitHub Actions workflows are set up as follows:

1. **CI Workflow** (`ci.yml`) - Runs on every push to `main` branch
   - ✅ ESLint
   - ✅ Unit Tests
   - ✅ Docker Hub push

2. **CD Workflow** (`cd.yml`) - Runs **ONLY** when you push a **tag**
   - ✅ Build and push to ECR
   - ✅ Deploy to ECS
   - ✅ Use S3 bucket

## How to Trigger the CD Workflow (ECR/ECS Deployment)

The CD workflow only runs when you push a tag. Here's how to do it:

### Step 1: Make sure your code is committed and pushed

```powershell
cd "Lab 9"
git add .
git commit -m "Add S3 integration and ECS configuration"
git push origin main
```

### Step 2: Create and push a version tag

```powershell
# Create a new version tag (this updates package.json version)
npm version 0.9.0

# Push the tag to trigger the CD workflow
git push origin main --tags
```

Or if you want to create a tag manually:

```powershell
# Create a tag
git tag v0.9.0

# Push the tag
git push origin v0.9.0
```

### Step 3: Check GitHub Actions

1. Go to your GitHub repository
2. Click on the **Actions** tab
3. You should now see **TWO** workflows:
   - **CI** workflow (runs on every push) - Shows ESLint/Unit Tests
   - **CD** workflow (runs on tag push) - Shows ECR/ECS deployment

## What Happens When You Push a Tag

When you push a tag like `v0.9.0`, the CD workflow will:

1. ✅ Configure AWS credentials from GitHub Secrets
2. ✅ Login to Amazon ECR
3. ✅ Build Docker image from `Lab 9/Dockerfile`
4. ✅ Push image to ECR: `ccp555-2025f/lab9-demo:v0.9.0`
5. ✅ Update ECS task definition with new image
6. ✅ Deploy to ECS service `fragments` in cluster `fragments-cluster`
7. ✅ Container will use S3 bucket `hhpatel31-fragments` via IAM role

## Verify Deployment

After pushing the tag:

1. **Check GitHub Actions**:
   - Go to Actions tab
   - Click on the "cd" workflow run
   - Verify all steps completed successfully

2. **Check ECR**:
   - Go to AWS Console → ECR
   - Repository: `ccp555-2025f/lab9-demo`
   - Should see image tagged `v0.9.0`

3. **Check ECS**:
   - Go to AWS Console → ECS
   - Cluster: `fragments-cluster`
   - Service: `fragments`
   - Should see new tasks running

4. **Check CloudWatch Logs**:
   - Go to AWS Console → CloudWatch → Log Groups
   - Log Group: `/ecs/fragments`
   - Should see application logs

## Troubleshooting

### CD Workflow Not Appearing
- Make sure you pushed a **tag**, not just a commit
- Tag must start with `v` (e.g., `v0.9.0`)
- Check the Actions tab - CD workflow should appear separately

### Workflow Fails
- Check GitHub Secrets are set correctly
- Verify ECS cluster `fragments-cluster` exists
- Verify ECS service `fragments` exists
- Check CloudWatch logs for errors

### Container Not Using S3
- Verify `AWS_S3_BUCKET_NAME` secret is set in GitHub
- Verify IAM role `LabRole` has S3 permissions
- Check CloudWatch logs for S3 errors

## Summary

- **Regular push** → Triggers CI (ESLint/Unit Tests)
- **Tag push** → Triggers CD (ECR/ECS Deployment with S3)

To deploy: `npm version 0.9.0` then `git push origin main --tags`

