# Setup AWS credentials script
# Run this script to configure AWS CLI credentials

$awsDir = "$env:USERPROFILE\.aws"

# Create .aws directory if it doesn't exist
if (-not (Test-Path $awsDir)) {
    New-Item -ItemType Directory -Path $awsDir -Force | Out-Null
}

# Create credentials file
# NOTE: Replace YOUR_ACCESS_KEY_ID, YOUR_SECRET_ACCESS_KEY, and YOUR_SESSION_TOKEN
# with your actual AWS credentials before running this script
$accessKeyId = $env:AWS_ACCESS_KEY_ID
$secretAccessKey = $env:AWS_SECRET_ACCESS_KEY
$sessionToken = $env:AWS_SESSION_TOKEN

if (-not $accessKeyId -or -not $secretAccessKey) {
    Write-Host "Error: AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables must be set" -ForegroundColor Red
    Write-Host "Please set these environment variables and run the script again" -ForegroundColor Yellow
    exit 1
}

$credentialsContent = @"
[default]
aws_access_key_id=$accessKeyId
aws_secret_access_key=$secretAccessKey
"@

if ($sessionToken) {
    $credentialsContent += "`naws_session_token=$sessionToken"
}

$credentialsPath = Join-Path $awsDir "credentials"
Set-Content -Path $credentialsPath -Value $credentialsContent -Force
Write-Host "AWS credentials file created at: $credentialsPath" -ForegroundColor Green

# Create config file
$configContent = @"
[default]
region = us-east-1
output = json
"@

$configPath = Join-Path $awsDir "config"
Set-Content -Path $configPath -Value $configContent -Force
Write-Host "AWS config file created at: $configPath" -ForegroundColor Green

Write-Host "`nAWS credentials configured successfully!" -ForegroundColor Green
Write-Host "You can now run AWS CLI commands." -ForegroundColor Green

