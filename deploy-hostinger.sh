#!/bin/bash

# Hostinger deployment script for subdirectory structure
ENVIRONMENT=${1:-production}
USERNAME=${2:-your-username}
REMOTE_HOST="techonward.in"
REMOTE_PATH="public_html"

# Determine deployment subdirectory and environment file
case $ENVIRONMENT in
  "dev"|"development")
    SUBDIR="projects/advik/dev"
    ENV_FILE="development"
    NPM_SCRIPT="dev"
    ;;
  "qa")
    SUBDIR="projects/advik/qa"
    ENV_FILE="qa"
    NPM_SCRIPT="qa"
    ;;
  "prod"|"production")
    SUBDIR="projects/advik/prod"
    ENV_FILE="prod"
    NPM_SCRIPT="prod"
    ;;
  *)
    echo "Unknown environment: $ENVIRONMENT"
    echo "Usage: ./deploy-hostinger.sh [development|qa|production] [username]"
    exit 1
    ;;
esac

FULL_REMOTE_PATH="$REMOTE_PATH/$SUBDIR"

echo "Deploying to Hostinger - Environment: $ENVIRONMENT"
echo "Remote path: $FULL_REMOTE_PATH"

# Build the application
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
    .env.$ENV_FILE \
    db/ \
    api/ \
    shared/ \
    scripts/ \
    client/dist/ \
    setup-env.sh

# Upload to Hostinger
echo "Uploading to Hostinger..."
scp -P 65002 deploy.tar.gz $USERNAME@techonward.in:$REMOTE_PATH/

# Remote deployment commands
echo "Executing deployment on remote server..."
ssh -p 65002 $USERNAME@techonward.in << EOF
    cd $REMOTE_PATH
    mkdir -p $SUBDIR
    cd $SUBDIR
    tar -xzf ../../deploy.tar.gz
    cp .env.$ENV_FILE .env
    source ~/.bashrc
    npm install --production
    mkdir -p public/uploads
    chmod -R 755 public/uploads
    chmod 644 .env
    chmod +x setup-env.sh
    # Restart application (method depends on Hostinger setup)
    # pkill -f "node server.js" && nohup node server.js > app.log 2>&1 &
EOF

# Cleanup
echo "Cleaning up..."
rm deploy.tar.gz

echo "Deployment complete!"
echo "Access your application at: https://$REMOTE_HOST/$SUBDIR"
