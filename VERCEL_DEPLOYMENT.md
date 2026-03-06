# Vercel Backend Deployment Guide

## Prerequisites
- Vercel account
- GitHub repository connected to Vercel

## Step 1: Install Vercel CLI (optional)
```bash
npm i -g vercel
```

## Step 2: Deploy via Vercel Dashboard

### Option A: Using Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect the `vercel.json` configuration
5. Click "Deploy"

### Option B: Using Vercel CLI
```bash
# Install dependencies
npm install

# Deploy to Vercel
vercel --prod
```

## Step 3: Environment Variables
After deployment, set these environment variables in Vercel Dashboard:

1. Go to your project settings in Vercel Dashboard
2. Navigate to "Environment Variables"
3. Add the following variables:

```
JWT_SECRET=your-super-secure-jwt-secret-here
NODE_ENV=production
```

## Step 4: Update Frontend API URL
Update your frontend to use the Vercel backend URL:

In `client/src/api-fallback.ts`, update the API_BASE:
```typescript
const API_BASE = import.meta.env.VITE_API_BASE || 'https://your-vercel-app-name.vercel.app'
```

Or set it in your frontend's `.env.production`:
```
VITE_API_BASE=https://your-vercel-app-name.vercel.app
```

## Step 5: Test the Deployment
1. Your backend will be available at: `https://your-vercel-app-name.vercel.app`
2. Test API endpoints:
   - GET `/api/me`
   - POST `/api/auth/login`
   - GET `/api/users`

## Important Notes

### Database
- The SQLite database will be created in Vercel's temporary storage
- For production, consider using Vercel Postgres or external database
- Current setup is suitable for demo/testing

### Limitations
- Serverless functions have execution time limits (10 seconds max)
- File uploads may have size restrictions
- Database persistence is limited in serverless environment

### Troubleshooting
- Check Vercel function logs for errors
- Ensure all environment variables are set
- Verify the API routes are correctly configured

## Automatic Deployment
Once connected to GitHub, Vercel will automatically redeploy when you push to your main branch.
