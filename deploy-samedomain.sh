#!/bin/bash

# Path-based deployment for same domain
ENVIRONMENT=${1:-production}
USERNAME=${2:-your-username}

echo "=== Path-Based Deployment ==="
echo "Environment: $ENVIRONMENT"
echo "Username: $USERNAME"

# Map environment to directory path
case $ENVIRONMENT in
  "dev"|"development")
    SUBDIR="advik-dev"
    ENV_FILE="development"
    NPM_SCRIPT="dev"
    ;;
  "qa")
    SUBDIR="advik-qa"
    ENV_FILE="qa"
    NPM_SCRIPT="qa"
    ;;
  "prod"|"production")
    SUBDIR="advik-prod"
    ENV_FILE="prod"
    NPM_SCRIPT="prod"
    ;;
  *)
    echo "Unknown environment: $ENVIRONMENT"
    echo "Usage: ./deploy-samedomain.sh [development|qa|production] [username]"
    exit 1
    ;;
esac

FULL_REMOTE_PATH="$SUBDIR"

echo "Deploying to Hostinger - Environment: $ENVIRONMENT"
echo "Remote path: $FULL_REMOTE_PATH"
echo "URL: https://techonward.in/$SUBDIR"

# Build locally first
echo "Building application..."
npm run deploy:$NPM_SCRIPT

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
    db/ \
    api/ \
    shared/ \
    scripts/ \
    client/dist \
    .env.$ENV_FILE

# Upload to Hostinger
echo "Uploading to Hostinger..."
scp -P 65002 deploy.tar.gz $USERNAME@techonward.in:~

# Remote setup and deployment
echo "Setting up on Hostinger..."
ssh -p 65002 $USERNAME@techonward.in << 'EOF'
    # Check if tar file exists
    if [ ! -f ~/deploy.tar.gz ]; then
        echo "Error: deploy.tar.gz not found on server"
        exit 1
    fi
    
    # Create directory
    mkdir -p ~/$SUBDIR
    cd ~/$SUBDIR
    
    # Clean and extract
    rm -rf * 2>/dev/null || true
    tar -xzf ~/deploy.tar.gz
    
    # Move frontend files to web root
    if [ -d "client" ]; then
        mv client/dist/* . 2>/dev/null || true
        mv client/dist/.* . 2>/dev/null || true
        rm -rf client
    fi
    
    # Setup environment
    if [ -f ~/.env.$ENV_FILE ]; then
        cp ~/.env.$ENV_FILE .env
    fi
    
    # Setup directories and permissions
    mkdir -p public/uploads
    chmod -R 755 public/uploads
    
    # Create/update .htaccess for React Router
    cat > .htaccess << 'HTACCESS'
RewriteEngine On
RewriteBase /

# Handle React Router - redirect all requests to index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# API proxy to Node.js backend
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/(.*)$ http://localhost:3000/api/\$1 [P,L]

# Security headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
</IfModule>
HTACCESS
    
    # Start Node.js application
    echo "Starting Node.js application..."
    export PATH="\$PATH:/usr/bin:/usr/local/bin"
    
    # Kill existing process and start new one
    pkill -f "node server.js" 2>/dev/null || true
    nohup node server.js > app.log 2>&1 &
    
    echo "Deployment completed!"
EOF

# Cleanup
rm deploy.tar.gz

echo "=== Deployment Complete ==="
echo "Access your app at: https://techonward.in/$SUBDIR"
