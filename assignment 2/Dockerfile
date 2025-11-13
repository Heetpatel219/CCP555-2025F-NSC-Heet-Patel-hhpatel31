# Multi-stage Dockerfile for fragments microservice
# Stage 1: Build dependencies
FROM node:lts-alpine AS builder

LABEL maintainer="Heet Patel <hhpatel31@myseneca.ca>"
LABEL description="Fragments microservice Docker image"

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --production && \
    npm cache clean --force

# Stage 2: Production image
FROM node:lts-alpine

LABEL maintainer="Heet Patel <hhpatel31@myseneca.ca>"
LABEL description="Fragments microservice Docker image"

# Create app directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy dependencies from builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application files
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "src/index.js"]
