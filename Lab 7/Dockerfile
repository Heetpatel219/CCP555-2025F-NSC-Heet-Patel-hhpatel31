# Multi-stage build for optimized production image
# Stage 1: Build stage
FROM node:22.11.0-alpine AS builder

LABEL maintainer="Heet Patel <hhpatel31@myseneca.ca>"
LABEL description="Course: CCP555 Lab: Lab 7 (Multi-stage)"

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci --include=dev && npm cache clean --force

# Copy source code
COPY ./src ./src

# Copy the .htpasswd file for authentication
COPY ./.htpasswd ./.htpasswd

# Stage 2: Production stage
FROM node:22.11.0-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init=1.2.5

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S fragments -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/src ./src
COPY --from=builder /app/.htpasswd ./.htpasswd

# Change ownership to non-root user
RUN chown -R fragments:nodejs /app
USER fragments

# Environment variables
ENV PORT=8080
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false
ENV HTPASSWD_FILE=/app/.htpasswd
ENV DOCKER=true

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "start"]

# Expose port
EXPOSE 8080