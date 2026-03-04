#!/bin/bash

# Simple Hostinger deployment script
ENVIRONMENT=${1:-production}
USERNAME=${2:-your-username}

echo "=== Simple Hostinger Deployment ==="
echo "Environment: $ENVIRONMENT"
echo "Username: $USERNAME"

# Build locally first
echo "Building application..."
case $ENVIRONMENT in
  "dev"|"development")
    npm run deploy:dev
    ;;
  "qa")
    npm run deploy:qa
    ;;
  "prod"|"production")
    npm run deploy:prod
    ;;
  *)
    echo "Unknown environment: $ENVIRONMENT"
    exit 1
    ;;
esac

# Create deployment package
echo "Creating deployment package..."
tar -czf deploy.tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=db.sqlite3 \
    --exclude=.env.development \
    --exclude=.env.qa \
    --exclude=.env.prod \
    server.js \
    package.json \
    package-lock.json \
    client/dist/ \
    db/ \
    api/ \
    shared/ \
    scripts/

# Upload to Hostinger
echo "Uploading to Hostinger..."
scp -P 65002 deploy.tar.gz $USERNAME@techonward.in:~

# Remote setup and deployment
echo "Setting up on Hostinger..."
ssh -p 65002 $USERNAME@techonward.in << 'EOF'
    # Create directories
    mkdir -p ~/projects/advik/dev
    mkdir -p ~/projects/advik/qa
    mkdir -p ~/projects/advik/prod
    
    # Extract based on environment
    case $ENVIRONMENT in
      "dev"|"development")
        cd ~/projects/advik/dev
        tar -xzf ~/deploy.tar.gz --strip-components=1
        cp .env.development .env 2>/dev/null || echo "No .env.development file found"
        ;;
      "qa")
        cd ~/projects/advik/qa
        tar -xzf ~/deploy.tar.gz --strip-components=1
        cp .env.qa .env 2>/dev/null || echo "No .env.qa file found"
        ;;
      "prod"|"production")
        cd ~/projects/advik/prod
        tar -xzf ~/deploy.tar.gz --strip-components=1
        cp .env.prod .env 2>/dev/null || echo "No .env.prod file found"
        ;;
    esac
    
    # Setup directories and permissions
    mkdir -p public/uploads
    chmod -R 755 public/uploads
    
    # Try to start the application
    echo "Starting Node.js application..."
    export PATH="\$PATH:/usr/bin:/usr/local/bin"
    which node || echo "Node.js not found in PATH"
    which npm || echo "npm not found in PATH"
    
    # Kill existing process and start new one
    pkill -f "node server.js" 2>/dev/null || true
    nohup node server.js > app.log 2>&1 &
    
    echo "Deployment completed!"
EOF

# Cleanup
rm deploy.tar.gz

echo "=== Deployment Complete ==="
echo "Access your app at: https://techonward.in/projects/advik/$ENVIRONMENT"
