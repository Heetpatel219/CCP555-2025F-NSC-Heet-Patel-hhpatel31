# Fragments Microservice - Assignment 3

A cloud-native microservice for storing and managing text and image fragments.

## Features

### Core Features
- **Create** fragments of various types (text, JSON, HTML, Markdown, images)
- **Read** fragment data and metadata
- **Update** existing fragments
- **Delete** fragments
- **Convert** between supported formats (e.g., Markdown → HTML, PNG → JPEG)

### Bonus Features
- **Search** - Filter fragments by type, size, date, or tags
- **Tags** - Organize fragments with tags (including AI auto-tagging)
- **Versioning** - Track version history of fragments
- **Sharing** - Share fragments with other users
- **Analytics** - View usage statistics
- **AI Features** - Text extraction (Textract) and label detection (Rekognition)

## Supported Types

| Type | Extensions | Conversions |
|------|------------|-------------|
| `text/plain` | .txt | - |
| `text/markdown` | .md | → .html, .txt |
| `text/html` | .html | → .txt |
| `text/csv` | .csv | → .txt, .json |
| `application/json` | .json | → .txt |
| `image/png` | .png | → .jpg, .webp, .gif, .avif |
| `image/jpeg` | .jpg | → .png, .webp, .gif, .avif |
| `image/webp` | .webp | → .png, .jpg, .gif, .avif |
| `image/gif` | .gif | → .png, .jpg, .webp |
| `image/avif` | .avif | → .png, .jpg, .webp, .gif |

## Quick Start

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start with Docker Compose** (includes DynamoDB Local and LocalStack)
   ```bash
   docker compose up -d
   ```

3. **Setup local AWS resources**
   ```bash
   ./scripts/local-aws-setup.sh
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

5. **Run tests**
   ```bash
   npm test                  # Unit tests
   npm run test:integration  # Integration tests (Hurl)
   npm run coverage          # Coverage report
   ```

### Production Deployment (AWS)

The service is deployed automatically via GitHub Actions:
- **CI** - Runs on every push to `main` (lint, tests, Docker Hub push)
- **CD** - Runs on every git tag (ECR push, ECS deploy)

## API Endpoints

### Core Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/v1/fragments` | List user's fragments |
| POST | `/v1/fragments` | Create a fragment |
| GET | `/v1/fragments/:id` | Get fragment data |
| GET | `/v1/fragments/:id.ext` | Get converted fragment |
| GET | `/v1/fragments/:id/info` | Get fragment metadata |
| PUT | `/v1/fragments/:id` | Update fragment |
| DELETE | `/v1/fragments/:id` | Delete fragment |

### Bonus Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/fragments/search` | Search fragments |
| GET | `/v1/fragments/analytics` | Overall analytics |
| GET | `/v1/fragments/shared` | Shared with me |
| GET | `/v1/fragments/:id/tags` | Get tags |
| POST | `/v1/fragments/:id/tags` | Add tags |
| DELETE | `/v1/fragments/:id/tags` | Remove tags |
| GET | `/v1/fragments/:id/versions` | Version history |
| GET | `/v1/fragments/:id/share` | Share info |
| POST | `/v1/fragments/:id/share` | Share fragment |
| DELETE | `/v1/fragments/:id/share` | Unshare |
| GET | `/v1/fragments/:id/analytics` | Fragment analytics |
| POST | `/v1/fragments/:id/extract-text` | OCR (Textract) |
| POST | `/v1/fragments/:id/detect-labels` | Labels (Rekognition) |

## Environment Variables

See `.env.example` for a complete list of configuration options.

## Author

Heet Patel - CCP555 Assignment 3
