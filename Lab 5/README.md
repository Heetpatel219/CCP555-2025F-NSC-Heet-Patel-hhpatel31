# Lab 5 - Fragments API Server with Docker

A RESTful API server for managing text fragments with authentication, in-memory storage, and Docker containerization.

## Features

- **Authentication**: HTTP Basic Auth and AWS Cognito support
- **Fragment Management**: Create, read, and delete text fragments
- **In-Memory Storage**: Fast, temporary storage for development
- **Structured Logging**: Pino-based logging with proper log levels
- **Health Checks**: Non-cacheable health endpoint
- **API Versioning**: All routes use `/v1` versioning

## API Endpoints

### Health Check
- `GET /` - Returns server health status

### Fragments
- `GET /v1/fragments` - List user's fragments
- `POST /v1/fragments` - Create a new fragment
- `GET /v1/fragments/:id` - Get a specific fragment

## Authentication

The API supports two authentication methods:
1. **HTTP Basic Auth** (for development/testing)
2. **AWS Cognito** (for production)

## Environment Variables

- `LOG_LEVEL` - Logging level (debug, info, warn, error)
- `NODE_ENV` - Environment (development, production)
- `API_URL` - Base URL for the API (used in Location headers)
- `HTPASSWD_FILE` - Path to htpasswd file for Basic Auth
- `COGNITO_USER_POOL_ID` - AWS Cognito User Pool ID
- `COGNITO_CLIENT_ID` - AWS Cognito Client ID
- `COGNITO_REGION` - AWS region for Cognito

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run coverage

# Lint code
npm run lint
```

## Testing

The project includes comprehensive unit tests and integration tests:
- Fragment model tests
- API route tests
- Authentication tests
- Memory database tests
- Response format tests

## Docker Deployment

### Building the Docker Image

```bash
# Build the Docker image
docker build -t fragments:latest .

# Run the container
docker run --rm --name fragments -p 8080:8080 fragments:latest

# Run with environment file
docker run --rm --name fragments --env-file env.jest -p 8080:8080 fragments:latest

# Run in detached mode
docker run -d --name fragments -p 8080:8080 fragments:latest
```

### Docker Commands

```bash
# View container logs
docker logs fragments

# Follow logs in real-time
docker logs -f fragments

# Stop container
docker stop fragments

# Remove container
docker rm fragments

# List running containers
docker ps

# List all containers
docker ps -a
```

## Deployment

The server is designed to run on AWS EC2 with proper environment configuration for production use. The Docker containerization makes deployment consistent across different environments.

## Author

Heet Patel - [GitHub](https://github.com/Heetpatel219/CCP555-2025F-NSC-Heet-Patel-hhpatel31)

