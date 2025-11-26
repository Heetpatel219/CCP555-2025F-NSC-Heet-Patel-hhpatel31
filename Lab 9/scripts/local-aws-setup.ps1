# Setup steps for working with LocalStack and DynamoDB local instead of AWS.
# Assumes aws cli is installed and LocalStack and DynamoDB local are running.

# Add AWS CLI to PATH if installed via pip --user
$awsCliPath = "$env:APPDATA\Python\Python313\Scripts"
if (Test-Path $awsCliPath) {
    $env:PATH = "$awsCliPath;$env:PATH"
}

# Setup AWS environment variables
Write-Host "Setting AWS environment variables for LocalStack" -ForegroundColor Green

$env:AWS_ACCESS_KEY_ID = "test"
Write-Host "AWS_ACCESS_KEY_ID=test"

$env:AWS_SECRET_ACCESS_KEY = "test"
Write-Host "AWS_SECRET_ACCESS_KEY=test"

$env:AWS_SESSION_TOKEN = "test"
Write-Host "AWS_SESSION_TOKEN=test"

$env:AWS_DEFAULT_REGION = "us-east-1"
Write-Host "AWS_DEFAULT_REGION=us-east-1"

# Wait for LocalStack to be ready, by inspecting the response from healthcheck
Write-Host "Waiting for LocalStack S3..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$ready = $false

while (-not $ready -and $attempt -lt $maxAttempts) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:4566/_localstack/health" -Method Get -ErrorAction Stop
        if ($response.services.s3 -eq "available" -or $response.services.s3 -eq "running") {
            $ready = $true
            Write-Host "LocalStack S3 Ready" -ForegroundColor Green
        } else {
            Start-Sleep -Seconds 2
            $attempt++
        }
    } catch {
        Start-Sleep -Seconds 2
        $attempt++
    }
}

if (-not $ready) {
    Write-Host "ERROR: LocalStack S3 did not become ready after $maxAttempts attempts" -ForegroundColor Red
    exit 1
}

# Create our S3 bucket with LocalStack
Write-Host "Creating LocalStack S3 bucket: fragments" -ForegroundColor Green
try {
    aws --endpoint-url=http://localhost:4566 s3api create-bucket --bucket fragments
    Write-Host "S3 bucket created successfully" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to create S3 bucket" -ForegroundColor Red
    exit 1
}

# Setup DynamoDB Table with dynamodb-local
Write-Host "Creating DynamoDB-Local DynamoDB table: fragments" -ForegroundColor Green
try {
    aws --endpoint-url=http://localhost:8000 `
        dynamodb create-table `
        --table-name fragments `
        --attribute-definitions `
            AttributeName=ownerId,AttributeType=S `
            AttributeName=id,AttributeType=S `
        --key-schema `
            AttributeName=ownerId,KeyType=HASH `
            AttributeName=id,KeyType=RANGE `
        --provisioned-throughput `
            ReadCapacityUnits=10,WriteCapacityUnits=5
    
    Write-Host "DynamoDB table created successfully" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to create DynamoDB table" -ForegroundColor Red
    exit 1
}

# Wait until the Fragments table exists in dynamodb-local
Write-Host "Waiting for DynamoDB table to be ready..." -ForegroundColor Yellow
try {
    aws --endpoint-url=http://localhost:8000 dynamodb wait table-exists --table-name fragments
    Write-Host "DynamoDB table is ready!" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to wait for DynamoDB table" -ForegroundColor Red
    exit 1
}

Write-Host "`nSetup completed successfully!" -ForegroundColor Green
