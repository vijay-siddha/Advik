# Multi-Environment Deployment Guide

## Overview
This project supports deployment across three environments on Hostinger:
- **DEV** (Development) - For testing and development
- **QA** (Quality Assurance) - For staging and testing
- **PROD** (Production) - For live production use

## Environment Configuration

### Environment Files
- `.env.development` - Development environment settings
- `.env.qa` - QA environment settings  
- `.env.prod` - Production environment settings
- `.env.example` - Template for new environments

### Key Differences Between Environments

| Setting | DEV | QA | PROD |
|---------|-----|-----|------|
| JWT_SECRET | Development secret | QA secret | Production secret |
| LOG_LEVEL | debug | info | error |
| CORS_ORIGIN | localhost | qa-domain.com | prod-domain.com |
| RATE_LIMIT | Higher limit | Medium limit | Strict limit |
| SWAGGER | Enabled | Enabled | Disabled |

## Deployment Methods

### 1. Manual Deployment
```bash
# Setup environment
./setup-env.sh [dev|qa|prod]

# Build application
npm run build

# Deploy to Hostinger (using provided script)
./deploy-hostinger.sh [dev|qa|prod] [host] [user] [path]
```

### 2. CI/CD Deployment (GitHub Actions)
- **develop branch** → DEV environment
- **qa branch** → QA environment  
- **main branch** → PROD environment

### 3. Hostinger Git Integration
1. Connect repository to Hostinger
2. Select appropriate branch for each environment
3. Set environment variables in Hostinger panel

## Hostinger Setup Instructions

### 1. Server Configuration
- Ensure Node.js 18+ is installed
- Configure Apache/Nginx for Node.js
- Set up file permissions for uploads directory

### 2. Environment Variables
Set these in Hostinger control panel:
```
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secure-secret
DATABASE_FILE=./db.sqlite3
FRONTEND_URL=https://yourdomain.com
```

### 3. Database Setup
- Upload existing `db.sqlite3` or let app create it
- Set write permissions: `chmod 666 db.sqlite3`
- Run seed script if needed: `npm run db:seed`

### 4. Static File Serving
- Build React app: `npm run build:client`
- Serve static files from `client/dist/`
- Configure web server for React Router

## Branch Strategy

### Git Workflow
```
main (production)
├── qa (staging)
└── develop (development)
```

### Deployment Rules
- **main** → PROD environment (after testing)
- **qa** → QA environment (for testing)
- **develop** → DEV environment (for development)

## Testing Strategy

### Environment-Specific Testing
- **DEV**: Manual testing, feature validation
- **QA**: Automated tests, integration testing
- **PROD**: Smoke tests, health checks

### Health Check Endpoints
- `/api/health` - Basic health check
- `/api/db/health` - Database connectivity check

## Monitoring and Logging

### Log Levels
- **DEV**: Debug level logs
- **QA**: Info level logs
- **PROD**: Error level logs only

### Monitoring
- Use Hostinger's built-in monitoring
- Monitor database size and performance
- Set up alerts for application errors

## Security Considerations

### Production Security
- Use strong JWT secrets
- Enable HTTPS
- Set appropriate CORS origins
- Limit file upload sizes
- Enable rate limiting

### Environment Isolation
- Separate databases for each environment
- Different JWT secrets per environment
- Environment-specific API keys

## Rollback Procedure

### Manual Rollback
1. Restore previous database backup
2. Deploy previous code version
3. Verify application health

### Automated Rollback
- CI/CD pipeline can be configured for auto-rollback
- Use feature flags for gradual rollouts

## Troubleshooting

### Common Issues
1. **Database permissions**: Ensure write access to db.sqlite3
2. **Port conflicts**: Check if port 3000 is available
3. **CORS errors**: Verify FRONTEND_URL setting
4. **Build failures**: Check Node.js version compatibility

### Debug Commands
```bash
# Check application logs
tail -f app.log

# Verify database connection
curl http://localhost:3000/api/db/health

# Check environment variables
printenv | grep NODE_ENV
```

## Maintenance

### Regular Tasks
- Database backups
- Log rotation
- Security updates
- Performance monitoring

### Backup Strategy
- Daily database backups
- Code repository backups
- Configuration file backups
