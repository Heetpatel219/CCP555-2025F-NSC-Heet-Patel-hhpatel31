# ECS Setup Guide for Lab 9

This guide will help you complete the ECS configuration for Lab 9.

## Step 1: Find Your AWS Account ID

You need to find your AWS Account ID. Here are several ways:

### Option A: From AWS Console
1. Log in to AWS Console
2. Click on your username (top right)
3. Your Account ID is displayed in the dropdown menu

### Option B: From ECR Repository URI
If you already have an ECR repository, the URI looks like:
```
<ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/ccp555-2025f/lab7-demo
```
The `<ACCOUNT_ID>` part is your AWS Account ID.

### Option C: From AWS CLI (if configured)
```bash
aws sts get-caller-identity --query Account --output text
```

## Step 2: Update fragments-definition.json

1. Open `Lab 9/fragments-definition.json`
2. Replace `<YOUR_ACCOUNT_ID>` with your actual AWS Account ID (found in Step 1)
3. Replace `<YOUR_BUCKET_NAME>` with your S3 bucket name (e.g., `hhpatel31-fragments`)

Example:
```json
{
  "executionRoleArn": "arn:aws:iam::992382586628:role/LabRole",
  "taskRoleArn": "arn:aws:iam::992382586628:role/LabRole",
  ...
  "environment": [
    {
      "name": "AWS_S3_BUCKET_NAME",
      "value": "hhpatel31-fragments"
    }
  ]
}
```

## Step 3: Update GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Update or add the following secrets:

### Required Secrets:
- `AWS_ACCESS_KEY_ID` - Your AWS access key (from Learner Lab)
- `AWS_SECRET_ACCESS_KEY` - Your AWS secret key (from Learner Lab)
- `AWS_SESSION_TOKEN` - Your AWS session token (from Learner Lab)
- `AWS_S3_BUCKET_NAME` - Your S3 bucket name (e.g., `hhpatel31-fragments`)

### How to Get AWS Credentials:
1. Log in to AWS Academy Learner Lab
2. Go to **AWS Details** section
3. Click **AWS CLI** button
4. Copy the three values:
   - `aws_access_key_id`
   - `aws_secret_access_key`
   - `aws_session_token`

**⚠️ IMPORTANT**: Never commit these credentials to your repository!

## Step 4: Verify ECS Cluster and Service Exist

Before deploying, make sure you have:
1. **ECS Cluster** named `fragments-cluster`
2. **ECS Service** named `fragments` in that cluster
3. **CloudWatch Log Group** named `/ecs/fragments`

If these don't exist, you'll need to create them first (this was done in a previous lab).

## Step 5: Deploy

Once everything is configured:

1. Commit your changes:
   ```powershell
   git add .
   git commit -m "Add S3 integration and ECS configuration"
   git push origin main
   ```

2. Create a new version tag:
   ```powershell
   cd "Lab 9"
   npm version 0.9.0
   ```

3. Push the tag to trigger deployment:
   ```powershell
   git push origin main --tags
   ```

4. Monitor the deployment:
   - Go to GitHub → **Actions** tab
   - Watch the workflow run
   - Check for any errors

## Troubleshooting

### Deployment Fails with "Cluster not found"
- Make sure your ECS cluster is named exactly `fragments-cluster`
- Verify it exists in the `us-east-1` region

### Deployment Fails with "Service not found"
- Make sure your ECS service is named exactly `fragments`
- Verify it exists in the `fragments-cluster` cluster

### Task Fails to Start
- Check CloudWatch logs: `/ecs/fragments`
- Verify IAM role has S3 permissions
- Verify `AWS_S3_BUCKET_NAME` environment variable is set correctly
- Verify bucket exists and is accessible

### Image Pull Errors
- Verify ECR repository exists: `ccp555-2025f/lab9-demo`
- Check that the image was pushed successfully
- Verify IAM role has ECR pull permissions

## Notes

- The workflow uses IAM roles (`taskRoleArn`) for runtime permissions, NOT environment variables
- AWS credentials in GitHub Secrets are only used for deployment (ECR push, ECS update)
- The container itself uses the IAM role to access S3, not credentials from environment variables
- This is the secure way to do it in production!

