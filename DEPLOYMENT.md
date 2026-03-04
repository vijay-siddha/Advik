# Hostinger Deployment Configuration

## Environment Setup
Hostinger supports Node.js applications through their hosting plans. Below are the configurations for DEV, QA, and PROD environments.

### Server Requirements
- Node.js 18+ 
- NPM/Yarn
- SQLite support
- File upload permissions

### Deployment Files

#### .htaccess (for Apache servers)
```apache
# Enable URL rewriting
RewriteEngine On

# Redirect HTTP to HTTPS in production
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Handle React Router for Advik project
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^projects/advik/(.*)$ /projects/advik/$1/index.html [L,QSA]

# API proxy to Node.js server for Advik project
RewriteRule ^projects/advik/api/(.*)$ http://localhost:3000/api/$1 [P,L]

# Static file serving for Advik project
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^projects/advik/uploads/(.*)$ /projects/advik/uploads/$1 [L]
```

#### package.json scripts for Hostinger
```json
{
  "scripts": {
    "start": "node server.js",
    "build": "cd client && npm run build",
    "postinstall": "npm run build"
  }
}
```

### Environment Variables on Hostinger
Set these in Hostinger's environment variables section:

**DEV Environment:**
- NODE_ENV=development
- PORT=3000
- JWT_SECRET=your-dev-secret
- DATABASE_FILE=./db.sqlite3
- BASE_PATH=/projects/advik/dev
- FRONTEND_URL=https://techonward.in/projects/advik/dev

**QA Environment:**
- NODE_ENV=qa
- PORT=3000
- JWT_SECRET=your-qa-secret
- DATABASE_FILE=./db.sqlite3
- BASE_PATH=/projects/advik/qa
- FRONTEND_URL=https://techonward.in/projects/advik/qa

**PROD Environment:**
- NODE_ENV=production
- PORT=3000
- JWT_SECRET=your-prod-secret
- DATABASE_FILE=./db.sqlite3
- BASE_PATH=/projects/advik/prod
- FRONTEND_URL=https://techonward.in/projects/advik/prod

### Database Setup
1. Upload db.sqlite3 or let the app create it
2. Ensure write permissions for the database file
3. Run `npm run db:seed` for initial data if needed

### Static Files
- Client build files go to `client/dist/` (deployed to `/projects/advik/{env}/`)
- Configure Hostinger to serve static files from `client/dist/`
- Uploads directory: `public/uploads/` (deployed to `/projects/advik/{env}/uploads/`)

### Deployment Steps
1. Push code to repository
2. Use Hostinger's Git integration or upload files to `/projects/advik/{env}/`
3. Set environment variables for each environment
4. Run `npm install`
5. Start the application

### Directory Structure on Hostinger
```
public_html/
├── projects/
│   └── advik/
│       ├── dev/
│       │   ├── server.js
│       │   ├── client/dist/
│       │   ├── public/uploads/
│       │   └── .env
│       ├── qa/
│       │   ├── server.js
│       │   ├── client/dist/
│       │   ├── public/uploads/
│       │   └── .env
│       └── prod/
│           ├── server.js
│           ├── client/dist/
│           ├── public/uploads/
│           └── .env
```

### Monitoring
- Use Hostinger's monitoring tools
- Check logs regularly
- Monitor database size and performance
