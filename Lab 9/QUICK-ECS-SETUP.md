# Quick ECS Setup Checklist

## ✅ Completed Automatically
- ✅ AWS Account ID found: `992382586628`
- ✅ Task definition created: `fragments-definition.json`
- ✅ GitHub Actions workflow updated: `.github/workflows/cd.yml`
- ✅ Account ID added to task definition

## 📋 What You Need to Do

### 1. Update S3 Bucket Name
Open `Lab 9/fragments-definition.json` and replace `<YOUR_BUCKET_NAME>` with your actual bucket name.

**Example:** If your bucket is `hhpatel31-fragments`, change:
```json
"value": "<YOUR_BUCKET_NAME>"
```
to:
```json
"value": "hhpatel31-fragments"
```

### 2. Update GitHub Secrets
Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

Update these secrets with your current AWS credentials:
- `AWS_ACCESS_KEY_ID` = `ASIA6ODU4R4CHNT5K4KS`
- `AWS_SECRET_ACCESS_KEY` = `RMbSENzNY3aYrA3JYBBSNvzkK3MCCiQDnOp/4G9U`
- `AWS_SESSION_TOKEN` = (the full long token you provided)
- `AWS_S3_BUCKET_NAME` = (your bucket name, e.g., `hhpatel31-fragments`)

**⚠️ IMPORTANT**: 
- These credentials expire! Update them whenever you restart your Learner Lab
- Never commit credentials to your repository

### 3. Verify ECS Resources Exist
Make sure you have:
- ✅ ECS Cluster: `fragments-cluster`
- ✅ ECS Service: `fragments` 
- ✅ CloudWatch Log Group: `/ecs/fragments`

If these don't exist, create them first (from previous lab).

### 4. Deploy
```powershell
cd "Lab 9"
git add .
git commit -m "Add S3 integration and ECS configuration"
git push origin main

npm version 0.9.0
git push origin main --tags
```

### 5. Monitor Deployment
- Go to GitHub → **Actions** tab
- Watch the workflow run
- Check for any errors

## 🔍 Key Points

- **IAM Roles**: The task uses `taskRoleArn` for S3 access (secure, no credentials needed)
- **No Credentials in Container**: AWS credentials are NOT passed as environment variables to the container
- **Credentials Only for Deployment**: GitHub Secrets are only used to push to ECR and update ECS

## 📝 Files Updated

1. `fragments-definition.json` - ECS task definition (account ID added, bucket name needs update)
2. `.github/workflows/cd.yml` - Updated to deploy to ECS and use IAM roles
3. `ECS-SETUP-GUIDE.md` - Detailed setup guide

## 🐛 Troubleshooting

If deployment fails:
1. Check GitHub Actions logs
2. Verify bucket name matches exactly
3. Verify ECS cluster and service exist
4. Check CloudWatch logs: `/ecs/fragments`
5. Verify IAM role has S3 permissions

