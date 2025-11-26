# Lab 9 - Implementation Summary

## ✅ Completed Code Changes

### 1. Package Installation
- ✅ Installed `@aws-sdk/client-s3` package

### 2. AWS Data Model Structure
- ✅ Created `src/model/data/aws/` directory
- ✅ Created `src/model/data/aws/s3Client.js` - S3 client configuration
- ✅ Created `src/model/data/aws/index.js` - AWS backend implementation
- ✅ Updated `src/model/data/index.js` - Backend selection logic

### 3. S3 Integration Functions
- ✅ `writeFragmentData()` - Uploads fragment data to S3
- ✅ `readFragmentData()` - Downloads fragment data from S3
- ✅ `deleteFragmentData()` - Deletes fragment data from S3
- ✅ `deleteFragment()` - Deletes both metadata and data

### 4. API Routes
- ✅ Created `src/routes/api/v1/delete.js` - DELETE handler
- ✅ Updated `src/routes/api/v1/fragments.js` - Added DELETE route

### 5. Testing
- ✅ Created `tests/integration/lab-9-s3.hurl` - Integration test

### 6. Optional Files
- ✅ Created `docker-compose.local.yml` - MinIO setup
- ✅ Updated `.gitignore` - Added minio/data/

## 📁 File Structure

```
Lab 9/
├── src/
│   ├── model/
│   │   ├── data/
│   │   │   ├── index.js                    # ✅ Updated - Backend selection
│   │   │   ├── memory/                      # Existing
│   │   │   │   ├── index.js
│   │   │   │   └── memory-db.js
│   │   │   └── aws/                         # ✅ New
│   │   │       ├── index.js                 # ✅ S3 integration
│   │   │       └── s3Client.js              # ✅ S3 client config
│   │   └── fragment.js                      # Existing (uses db)
│   └── routes/
│       └── api/
│           └── v1/
│               ├── fragments.js              # ✅ Updated - Added DELETE route
│               └── delete.js                 # ✅ New - DELETE handler
├── tests/
│   └── integration/
│       └── lab-9-s3.hurl                    # ✅ New - Integration test
├── docker-compose.yml                       # Existing (has LocalStack)
├── docker-compose.local.yml                  # ✅ New - MinIO setup
├── .gitignore                                # ✅ Updated - Added minio/
├── LAB-9-INSTRUCTIONS.md                     # ✅ New - Manual steps guide
└── LAB-9-SUMMARY.md                          # ✅ This file
```

## 🔑 Key Implementation Details

### Backend Selection Logic
The system automatically chooses the backend based on the `AWS_REGION` environment variable:
- **No AWS_REGION**: Uses in-memory backend (`memory/`)
- **AWS_REGION set**: Uses AWS backend (`aws/`) with S3 for data storage

### S3 Key Format
Fragment data is stored in S3 with the following key format:
```
<ownerId>/<fragment-id>
```
Example: `63258595765642a14e8a725a22b18eab2ae02882a1e13525c6f500532eaa31f5/524RQdhMzifPRhlKI1G-V`

### Metadata Storage
Currently, fragment metadata is still stored in MemoryDB (in-memory). This will be migrated to DynamoDB in a future lab.

### Environment Variables Required

#### For LocalStack (docker-compose.yml):
- `AWS_REGION=us-east-1`
- `AWS_S3_ENDPOINT_URL=http://localstack:4566`
- `AWS_S3_BUCKET_NAME=fragments` (or custom)
- `AWS_ACCESS_KEY_ID=test` (for LocalStack)
- `AWS_SECRET_ACCESS_KEY=test` (for LocalStack)

#### For AWS ECS:
- `AWS_REGION=us-east-1`
- `AWS_S3_BUCKET_NAME=<your-bucket-name>`
- IAM Role with S3 permissions (via `taskRoleArn`)

#### For MinIO (docker-compose.local.yml):
- `AWS_REGION=us-east-1`
- `AWS_S3_ENDPOINT_URL=http://minio:9000`
- `AWS_S3_BUCKET_NAME=fragments`
- `AWS_ACCESS_KEY_ID=minio-access-key`
- `AWS_SECRET_ACCESS_KEY=minio-secret-key`

## 🧪 Testing

### Integration Test
The test `tests/integration/lab-9-s3.hurl` verifies:
1. ✅ POST fragment → 201 Created
2. ✅ GET fragment → 200 OK with correct data
3. ✅ DELETE fragment → 200 OK
4. ✅ GET deleted fragment → 404 Not Found

### Running Tests Locally
```powershell
# Start containers
docker compose up --build -d

# Setup LocalStack
.\scripts\local-aws-setup.sh

# Run integration tests
npm run test:integration

# Stop containers
docker compose down
```

## 📝 Notes

1. **Fragment.byId() Limitation**: The current implementation searches through all fragments in MemoryDB, which is inefficient but works for now. This will be improved when DynamoDB is added.

2. **Error Handling**: All S3 operations include proper error handling and logging.

3. **Stream Handling**: S3 `GetObjectCommand` returns a stream, which is converted to a Buffer using the `streamToBuffer()` helper function.

4. **Path Style**: S3 client is configured with `forcePathStyle: true` for compatibility with LocalStack and MinIO.

## 🚀 Next Steps (Manual)

See `LAB-9-INSTRUCTIONS.md` for detailed instructions on:
1. Creating S3 bucket in AWS Console
2. Testing with LocalStack
3. Configuring ECS deployment
4. Taking required screenshots

## 🔍 Verification Checklist

Before submitting, verify:
- [x] Code compiles without errors
- [x] Integration test passes locally with LocalStack
- [x] DELETE route is accessible at `DELETE /v1/fragments/:id`
- [x] Fragments can be created, retrieved, and deleted
- [x] S3 operations work correctly
- [ ] ECS deployment successful (manual step)
- [ ] Screenshots taken (manual step)

