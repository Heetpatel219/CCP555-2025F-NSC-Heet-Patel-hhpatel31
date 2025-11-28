# Script to create DynamoDB table
# Requires AWS CLI to be installed and configured

Write-Host "Creating DynamoDB table 'fragments'..." -ForegroundColor Yellow

$createTableCommand = @"
aws dynamodb create-table `
    --table-name fragments `
    --attribute-definitions `
        AttributeName=ownerId,AttributeType=S `
        AttributeName=id,AttributeType=S `
    --key-schema `
        AttributeName=ownerId,KeyType=HASH `
        AttributeName=id,KeyType=RANGE `
    --billing-mode PAY_PER_REQUEST `
    --region us-east-1
"@

try {
    Invoke-Expression $createTableCommand
    Write-Host "`nDynamoDB table creation initiated!" -ForegroundColor Green
    Write-Host "Waiting for table to become active..." -ForegroundColor Yellow
    
    # Wait for table to be active
    Start-Sleep -Seconds 5
    
    $describeCommand = "aws dynamodb describe-table --table-name fragments --region us-east-1 --query 'Table.{Name:TableName,Status:TableStatus,ARN:TableArn}'"
    Invoke-Expression $describeCommand
    
    Write-Host "`nDynamoDB table created successfully!" -ForegroundColor Green
} catch {
    Write-Host "`nError creating DynamoDB table:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "`nNote: If the table already exists, this is expected." -ForegroundColor Yellow
}

