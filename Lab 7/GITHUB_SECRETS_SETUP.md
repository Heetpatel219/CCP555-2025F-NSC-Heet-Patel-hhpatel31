# GitHub Secrets Setup Guide

## Why You Can't Add Secrets

If you cannot add secrets to your GitHub repository, it's usually because:

1. **The repository is a FORK** - Forks cannot have repository secrets. Secrets only work in the original repository, not forks.
2. **You don't have admin/write permissions** - Only repository admins can add secrets.
3. **You're looking in the wrong place** - Make sure you're in the correct repository settings.

## How to Add Secrets (If You Own the Repository)

### Step 1: Navigate to Repository Settings
1. Go to your GitHub repository
2. Click on **Settings** (top right of the repository page)
3. In the left sidebar, click **Secrets and variables** > **Actions**

### Step 2: Add DOCKERHUB_USERNAME Secret
1. Click **New repository secret**
2. In the **Name** field, enter exactly: `DOCKERHUB_USERNAME` (all caps, with underscore)
3. In the **Secret** field, enter your Docker Hub username
4. Click **Add secret**

### Step 3: Create Docker Hub Access Token
Before adding the password secret, you need to create a Docker Hub access token:

1. Go to https://hub.docker.com/
2. Log in to your Docker Hub account
3. Click on your profile icon (top right) > **Account Settings**
4. Go to **Security** > **New Access Token**
5. Give it a name (e.g., "GitHub Actions")
6. Set permissions to **Read & Write**
7. Click **Generate**
8. **COPY THE TOKEN IMMEDIATELY** - you won't be able to see it again!

### Step 4: Add DOCKERHUB_TOKEN Secret
1. Back in GitHub, click **New repository secret** again
2. In the **Name** field, enter exactly: `DOCKERHUB_TOKEN` (all caps, with underscore)
3. In the **Secret** field, paste the Docker Hub access token you just created
4. Click **Add secret**

## If Your Repository is a Fork

If you're working with a forked repository (like a class template), you have a few options:

### Option 1: Create Your Own Repository (Recommended)
1. Create a new repository under your GitHub account
2. Push your code to this new repository
3. Add secrets to your own repository

### Option 2: Work Without Docker Hub Push (For Testing)
You can modify the CI workflow to skip the Docker Hub push step for forks. The workflow will still run linting and tests.

### Option 3: Request Access
If this is a class repository, ask your instructor to add the secrets, or request admin access to add them yourself.

## Required Secrets

Your workflow needs these two secrets:

- `DOCKERHUB_USERNAME` - Your Docker Hub username (e.g., "yourusername")
- `DOCKERHUB_TOKEN` - Your Docker Hub access token (NOT your password)

## Verify Secrets Are Added

After adding both secrets, you should see them listed under:
**Settings** > **Secrets and variables** > **Actions** > **Repository secrets**

Note: You won't be able to view the secret values again after creation - only update or delete them.

