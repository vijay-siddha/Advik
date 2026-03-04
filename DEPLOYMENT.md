# GitHub Deployment Guide

This guide explains how to deploy the Advik application to GitHub Pages using GitHub Actions.

## Architecture Overview

- **Backend**: Node.js/Express with SQLite database
- **Frontend**: React with Vite
- **Deployment**: GitHub Pages (static hosting)
- **Database**: SQLite file (included in deployment)

## Prerequisites

1. GitHub repository with the code
2. GitHub account with repository admin access
3. GitHub Actions enabled for the repository

## Setup Steps

### 1. Configure GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Set **Source** to **GitHub Actions**
4. Save the settings

### 2. Set Repository Secrets (Optional)

For now, the JWT_SECRET is hardcoded in the configuration files. If you want to use GitHub Secrets later:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add `JWT_SECRET`: A secure random string for JWT signing
3. You can generate one with: `openssl rand -base64 32`

### 3. Update URLs

Before deploying, update these files with your actual GitHub username:

#### Backend Configuration
- **File**: `.env.production`
- **Update**: `FRONTEND_URL=https://[username].github.io/Advik`

#### Server Configuration
- **File**: `server.js` (line 98)
- **Update**: Replace `[username]` with your GitHub username

#### Frontend Configuration
- **File**: `client/.env.production`
- **Update**: `VITE_API_BASE=https://[username].github.io/Advik/api`

### 4. Push to Main Branch

The deployment workflows are triggered on pushes to the `main` branch. Simply push your changes:

```bash
git add .
git commit -m "Configure for GitHub Pages deployment"
git push origin main
```

## Deployment Process

### Backend Deployment
- **Trigger**: Push to main branch (changes to backend files)
- **Workflow**: `.github/workflows/deploy-backend.yml`
- **Output**: Backend API deployed to GitHub Pages
- **URL**: `https://[username].github.io/Advik/api`

### Frontend Deployment
- **Trigger**: Push to main branch (changes to frontend files)
- **Workflow**: `.github/workflows/deploy-frontend.yml`
- **Output**: React app deployed to GitHub Pages
- **URL**: `https://[username].github.io/Advik`

## Important Notes

### Database Limitations
- SQLite database is included in the deployment
- **Data persistence is limited** - GitHub Pages is static hosting
- Database will reset on each deployment
- For production use, consider external database services

### CORS Configuration
- Backend CORS is configured for GitHub Pages URLs
- Make sure to update the URLs with your actual username
- Local development still works with localhost URLs

### File Uploads
- Upload directory is included in the deployment
- Files will persist between deployments
- Consider storage limitations for large files

## Monitoring Deployment

1. Go to **Actions** tab in your GitHub repository
2. Monitor the workflow runs
3. Check for any errors in the deployment logs
4. Once successful, visit your GitHub Pages URL

## Local Development

To run locally:

```bash
# Install dependencies
npm install
cd client && npm install

# Start backend
npm start

# Start frontend (in another terminal)
cd client && npm run dev
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check that frontend URL matches backend CORS configuration
2. **Build Failures**: Check GitHub Actions logs for specific error messages
3. **404 Errors**: Ensure base path in Vite config matches repository name
4. **Database Issues**: SQLite file permissions and path configuration

### Debug Steps

1. Check GitHub Actions workflow logs
2. Verify environment variables and secrets
3. Test locally with production configuration
4. Check browser console for JavaScript errors

## Production Considerations

For a production-ready deployment, consider:

1. **External Database**: Replace SQLite with PostgreSQL/MongoDB
2. **CDN**: Use CDN for static assets
3. **Monitoring**: Add error tracking and monitoring
4. **Security**: Implement rate limiting and security headers
5. **Domain**: Configure custom domain for GitHub Pages

## URLs After Deployment

- **Frontend**: `https://[username].github.io/Advik` → `https://dimblek7.github.io/Advik`
- **Backend API**: `https://[username].github.io/Advik/api` → `https://dimblek7.github.io/Advik/api`
- **Health Check**: `https://dimblek7.github.io/Advik/api/health`

Replace `[username]` with your actual GitHub username.
