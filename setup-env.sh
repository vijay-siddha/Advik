#!/bin/bash

# Environment setup script for deployment
ENVIRONMENT=${1:-development}

echo "Setting up environment: $ENVIRONMENT"

# Copy the appropriate environment file
case $ENVIRONMENT in
  "dev"|"development")
    cp .env.development .env
    echo "Development environment configured"
    ;;
  "qa")
    cp .env.qa .env
    echo "QA environment configured"
    ;;
  "prod"|"production")
    cp .env.prod .env
    echo "Production environment configured"
    ;;
  *)
    echo "Unknown environment: $ENVIRONMENT"
    echo "Usage: ./setup-env.sh [development|qa|production]"
    exit 1
    ;;
esac

# Install dependencies
echo "Installing dependencies..."
npm install

# Install client dependencies
echo "Installing client dependencies..."
cd client && npm install && cd ..

# Create necessary directories
mkdir -p public/uploads

echo "Environment setup complete!"
