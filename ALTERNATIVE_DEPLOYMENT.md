# Alternative Deployment Options

Since GitHub Pages isn't available, here are two excellent alternatives for deploying your Node.js/React application.

## Option 1: Netlify (Recommended)

### Why Netlify?
- Free tier with generous limits
- Serverless functions for backend API
- Built-in CI/CD with GitHub integration
- Easy setup process

### Setup Steps

1. **Create Netlify Account**
   - Go to [netlify.com](https://netlify.com)
   - Sign up with your GitHub account

2. **Create New Site**
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Select the `Advik` repository

3. **Configure Build Settings**
   - **Build command**: `npm run build` (in client directory)
   - **Publish directory**: `client/dist`
   - **Functions directory**: `netlify/functions`

4. **Set Environment Variables**
   - Go to Site settings → Environment variables
   - Add: `NODE_ENV=production`
   - Add: `JWT_SECRET=advik-production-jwt-secret-temporary`

5. **Get Netlify Credentials**
   - Go to User settings → Applications
   - Create a new personal access token
   - Go to Site settings → Site details → Site ID

6. **Add GitHub Secrets**
   - In your GitHub repo: Settings → Secrets and variables → Actions
   - Add `NETLIFY_AUTH_TOKEN` (your personal access token)
   - Add `NETLIFY_SITE_ID` (your site ID)

### Automatic Deployment
- The workflow `.github/workflows/deploy-netlify.yml` will automatically deploy
- Push to main branch to trigger deployment

## Option 2: Vercel

### Why Vercel?
- Excellent Node.js support
- Serverless functions
- Automatic HTTPS
- Great performance

### Setup Steps

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with your GitHub account

2. **Import Project**
   - Click "New Project"
   - Import your `Advik` repository
   - Vercel will auto-detect the frameworks

3. **Configure Settings**
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: `cd client && npm run build`
   - **Output Directory**: client/dist

4. **Get Vercel Credentials**
   - Go to Vercel dashboard → Settings → Tokens
   - Create a new token
   - Go to Project Settings → General → Project ID

5. **Add GitHub Secrets**
   - In your GitHub repo: Settings → Secrets and variables → Actions
   - Add `VERCEL_TOKEN` (your Vercel token)
   - Add `ORG_ID` (your Vercel organization ID)
   - Add `PROJECT_ID` (your project ID)

### Automatic Deployment
- The workflow `.github/workflows/deploy-vercel.yml` will automatically deploy
- Push to main branch to trigger deployment

## Quick Start - Netlify (Easiest)

1. **Sign up**: [netlify.com](https://netlify.com)
2. **Connect GitHub**: Authorize your GitHub account
3. **Import repo**: Select the `Advik` repository
4. **Deploy**: Click "Deploy site"

Netlify will automatically:
- Build your React frontend
- Deploy your Node.js backend as serverless functions
- Set up API routing
- Provide you with a live URL

## URLs After Deployment

### Netlify
- **Frontend**: `https://your-site-name.netlify.app`
- **Backend API**: `https://your-site-name.netlify.app/api/*`

### Vercel
- **Frontend**: `https://your-project-name.vercel.app`
- **Backend API**: `https://your-project-name.vercel.app/api/*`

## Testing the Deployment

After deployment, test:
1. **Health check**: `/api/health`
2. **Frontend loads**: Visit the main URL
3. **API calls**: Try login/register functionality

## Troubleshooting

### Common Issues
1. **Build failures**: Check the build logs in Netlify/Vercel
2. **API errors**: Verify environment variables
3. **CORS issues**: Check that frontend URL matches backend CORS config

### Getting Help
- Netlify: [docs.netlify.com](https://docs.netlify.com)
- Vercel: [vercel.com/docs](https://vercel.com/docs)

## Recommendation

**Start with Netlify** - it's the easiest setup and works great with this type of application. The workflow is already configured and ready to use.

Once you choose a platform, just add the required secrets to GitHub and push to main branch to deploy!
