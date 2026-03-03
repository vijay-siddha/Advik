# Development Setup Instructions

## Project Overview
This is a full-stack user management system with component comparison features:
- **Backend**: Node.js/Express with SQLite database
- **Frontend**: React with TypeScript, Vite, and React Router
- **Database**: SQLite (file-based, no external DB required)

## Prerequisites
- Node.js (v18+) and npm
- Git
- Modern web browser

## Quick Start
```bash
# Clone and setup
git clone <repository-url>
cd basic_user_management

# Install dependencies (both frontend and backend)
npm install
cd client && npm install && cd ..

# Start both services
npm start &
cd client && npm run dev &
```
Then visit: http://localhost:5173

---

## Detailed Setup Instructions

### 1. Repository Setup
```bash
# Clone the repository
git clone <repository-url>
cd basic_user_management

# Check both directories exist
ls -la  # Should show: client/, server.js, package.json, db/, etc.
```

### 2. Backend Setup
```bash
# Install backend dependencies
npm install

# Start backend server
npm start
# Backend runs on: http://localhost:3000
# API endpoints available at: http://localhost:3000/api/
```

### 3. Frontend Setup
```bash
# Navigate to client directory
cd client

# Install frontend dependencies
npm install

# Environment Variables (Optional)
# Create .env file in client/ directory:
echo "VITE_API_BASE=http://localhost:3000" > client/.env

# Start frontend development server
npm run dev
# Frontend runs on: http://localhost:5173
```

### 4. Running Both Services
```bash
# Option 1: Two terminals (Recommended for development)
# Terminal 1:
npm start  # Backend

# Terminal 2:
cd client && npm run dev  # Frontend

# Option 2: Background processes
npm start &
cd client && npm run dev &
```

---

## Development Workflow

### Default Access
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Default Login**: 
  - Email: admin@example.com
  - Password: newpass123
  - Or use "Master Login" button

### Key Features
- **Authentication**: Register/Login with JWT tokens
- **Admin Panel**: User management (admin only, accessible via username dropdown)
- **Components**: Create and manage hierarchical components
- **Tree View**: See all components with parent-child relationships
- **Comparison**: Compare component attributes side-by-side

### Project Structure
```
basic_user_management/
├── server.js              # Backend server
├── package.json            # Backend dependencies & scripts
├── db/                    # Database files
│   └── sqlite.js          # SQLite database functions
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # App entry point
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
├── api/                   # API routes and middleware
│   ├── routes/            # API route handlers
│   └── middleware/        # Custom middleware
├── shared/                # Shared TypeScript types & schemas
│   ├── schema/            # JSON schemas
│   └── types.d.ts         # Generated types
├── scripts/               # Utility scripts
│   ├── generate-types.cjs # Type generation
│   ├── check-types.cjs    # Type validation
│   ├── seed-components.js # Database seeding
│   └── verify-components.js # Data verification
├── docs/                  # Documentation
├── public/                # Static files & uploads
│   └── uploads/           # File upload directory
└── db.sqlite3            # SQLite database file
```

---

## Common Development Tasks

### Adding New Dependencies
```bash
# Backend dependency
npm install <package-name>

# Frontend dependency
cd client && npm install <package-name>
```

### Database Operations
```bash
# Seed component data from JSON file
npm run db:seed

# Verify component data in database
npm run db:verify

# View database contents manually
sqlite3 db.sqlite3 "SELECT * FROM components;"

# Reset database (warning: deletes all data)
rm db.sqlite3
# New database will be created on next server start
```

### Code Generation
```bash
# Generate TypeScript types from schemas
npm run codegen

# Check types
npm run check:types
```

---

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill <PID>

# Or kill all Node processes
pkill -f node
```

### Frontend Not Loading
```bash
# Check if backend is running
curl http://localhost:3000/api/me

# Verify API base URL in client/.env
cat client/.env
```

### Database Issues
```bash
# Check database file permissions
ls -la db.sqlite3

# Recreate database
rm db.sqlite3
npm start  # Will create fresh database
```

### Common Errors
- **EADDRINUSE**: Port 3000 already in use → Kill existing process
- **JWT_SECRET warning**: Normal in development, set JWT_SECRET env var for production
- **CORS errors**: Ensure backend is running on port 3000
- **Module not found**: Run `npm install` in both root and client/ directories

---

## Production Deployment

### Environment Variables
```bash
# Backend (.env)
JWT_SECRET=your-production-secret
PORT=3000

# Frontend (client/.env)
VITE_API_BASE=https://your-domain.com
```

### Build Commands
```bash
# Build frontend for production
cd client && npm run build

# Start production server
npm start
```

---

## Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload during development
2. **Lazy Loading**: Frontend uses React.lazy() for better performance
3. **Tree View**: Toggle between tree and table views for components
4. **Admin Access**: Click username to access admin panel (admin users only)
5. **Default Routes**: 
   - `/` → Compare page (default)
   - `/admin` → Admin panel (hidden route)
   - `/components` → Components management
   - `/compare` → Component comparison

## Getting Help
- Check package.json scripts for available commands
- Review server.js for API endpoints
- Examine client/src/components/ for React components
- Use browser DevTools for debugging frontend issues
