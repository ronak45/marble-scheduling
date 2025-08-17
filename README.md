# Marble Technical Interview: Therapy Scheduling Application

> At Marble, we're on a mission to enable a happier & healthier generation of young people.
> 
> This interview gives you a small window into the kinds of problems we think about day to day.


This interview consists of two parts:

1. **[1.5 Hours] Take Home** – You’ll set up the application locally and complete one time boxed (1 hour) task:
    - [ ] Follow the README instructions to setup the application locally.
    - [ ] Once you have the application running, open the app and complete the time boxed task displayed in the application left side bar.

2. **[1 Hour] Zoom** – We’ll go over what you implemented in the take home task, then extend the application together with an important piece of functionality in a live working session.
    - Be prepared to run the application, share your screen and talk through what you did in the take home.

## Architecture Overview

This application follows a hybrid architecture where:
- **Frontend**: Next.js (React) running on port 3000
- **Backend**: FastAPI (Python) running on port 8000
- **Database**: PostgreSQL
- **API Communication**: Next.js proxies `/api/*` requests to the FastAPI backend

## Prerequisites

Before you begin, ensure you have the following installed on your Mac:

### 1. Install Homebrew (if not already installed)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Install Python 3.11 (if not already installed)
```bash
# Install Python using Homebrew
brew install python@3.11

# Verify installation
python3.11 --version
pip3.11 --version
```

### 3. Install PostgreSQL

```bash
# Install PostgreSQL using Homebrew
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create a database for the project
createdb therapist_scheduling
```
### 3. Install Node.js and Package Manager

#### Option A: Using Homebrew (Recommended)
```bash
# Install Node.js (includes npm)
brew install node

# Install pnpm (faster alternative to npm)
npm install -g pnpm

# Or install yarn (alternative package manager)
npm install -g yarn
```

#### Option B: Using Node Version Manager (nvm)
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or run:
source ~/.bashrc

# Install and use Node.js LTS
nvm install --lts
nvm use --lts

# Install package managers
npm install -g pnpm yarn
```

## Project Setup

### 1. Install Dependencies
```bash
# Install Node.js dependencies
npm install
# OR
pnpm install

# Install Python dependencies
pip3.11 install -r requirements.txt
# OR create a virtual environment (recommended)
python3.11 -m venv venv
source venv/bin/activate  # On macOS/Linux
pip install -r requirements.txt
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:
```bash
# Copy the example environment file
cp .env.example .env.local
```

Add your database connection string to `.env.local`:
```env
# Database
export DATABASE_URL="postgresql://username:password@localhost:5432/therapist_scheduling"

# Replace 'username' with your PostgreSQL username (usually your Mac username)
# Replace 'password' with your PostgreSQL password (leave empty if no password)
# Example: DATABASE_URL="postgresql://john:@localhost:5432/therapist_scheduling
```

### 3. Database Setup

#### Create and Seed the Database
```bash
# Set the DATABASE_URL environment variable for Python
source .env.local

# CD into the api directory & run the seed script to create tables and populate with sample data
cd api && python3.11 seed.py
# OR if using virtual environment:
source venv/bin/activate
cd api && python seed.py
```

## Running the Application

### Development Mode

You need to run both the frontend and backend servers:

#### Terminal 1: Start the FastAPI Backend
```bash
# Set environment variables
source .env.local

# CD into the api directory (if not already)
cd api

# Start FastAPI server
python3.11 -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
# OR if using virtual environment:
source venv/bin/activate
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

#### Terminal 2: Start the Next.js Frontend
```bash
# Start the Next.js development server
npm run dev
# OR
pnpm dev
```

The application will be available at:
- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`
- **API Documentation**: `http://localhost:8000/docs` (FastAPI auto-generated docs)

## Available Scripts

### Frontend (Next.js)
| Script | Description |
|--------|-------------|
| `dev` | Start Next.js development server |
| `lint` | Run ESLint |

### Backend (FastAPI)
| Script | Description |
|--------|-------------|
| `python api/seed.py` | Seed database with sample data |
| `uvicorn api.main:app --reload` | Start FastAPI development server |

## Project Structure
```
├── api/                       # FastAPI backend
│   ├── main.py               # FastAPI application
│   ├── models.py             # SQLAlchemy models
│   ├── schemas.py            # Pydantic schemas
│   ├── database.py           # Database connection
│   └── seed.py               # Database seeding script
├── app/                      # Next.js app directory
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── components/               # React components
│   ├── ui/                   # shadcn/ui components
│   └── ...                   # Custom components
├── lib/                      # Frontend utilities
│   └── api.ts                # API client functions
├── requirements.txt          # Python dependencies
├── package.json              # Node.js dependencies
├── next.config.mjs           # Next.js configuration (API proxy)
└── README.md                 # This file
```

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Language**: TypeScript

### Backend
- **Framework**: FastAPI
- **ORM**: SQLAlchemy
- **Database**: PostgreSQL
- **Language**: Python 3.11+

## Common Issues and Solutions

### Python Dependency Installation Errors

If you encounter errors like "Failed building wheel for psycopg2-binary" or "Failed building wheel for pydantic-core":
```bash
# Make sure you're using Python 3.11
python3 --version

# If not using Python 3.11, create a new virtual environment with Python 3.11
python3.11 -m venv venv
source venv/bin/activate

# Update pip and try installing again
pip install --upgrade pip
pip install -r requirements.txt

# If still having issues, try installing with --no-cache-dir
pip install --no-cache-dir -r requirements.txt
```

### "Unexpected token '<', "<!DOCTYPE "... is not valid JSON" Error

This error occurs when the frontend receives an HTML response instead of JSON from the API. Here's how to fix it:

#### 1. Ensure FastAPI Server is Running
```bash
# Check if FastAPI is running
curl http://localhost:8000/health

# If not running, start it:
source venv/bin/activate
export DATABASE_URL="postgresql://$(whoami):@localhost:5432/therapist_scheduling"
cd api
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

#### 2. Test the API Directly
```bash
# Test the API endpoints directly
python test_api.py

# Or manually test:
curl "http://localhost:8000/availabilities?insurance=bluecross
```

#### 3. Check Next.js Proxy Configuration

Ensure `next.config.mjs` has the correct proxy configuration:
```javascript
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'http://127.0.0.1:8000/:path*',
    },
  ]
}
```

#### 4. Use the Development Startup Script
```bash
# Make the script executable
chmod +x start-dev.sh

# Run the startup script
./start-dev.sh
```

This script will start both servers and check for port conflicts.

### Database Connection Issues
```bash
# Check PostgreSQL status
brew services list | grep postgresql

# Restart PostgreSQL if needed
brew services restart postgresql@15

# Test database connection
psql -d therapist_scheduling -c "SELECT COUNT(*) FROM therapists;
```

### Python Virtual Environment Issues
```bash
# Recreate virtual environment if corrupted
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Troubleshooting

### PostgreSQL Connection Issues
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Start PostgreSQL if not running
brew services start postgresql@15

# Check your database exists
psql -l | grep therapist_scheduling

# Create database if it doesn't exist
createdb therapist_scheduling
```

### Python Virtual Environment Issues
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Deactivate when done
deactivate
```

### Port Conflicts
```bash
# Run Next.js on different port
npm run dev -- -p 3001

# Run FastAPI on different port
uvicorn api.main:app --reload --port 800
```

### Database Reset
```bash
# Drop and recreate database
dropdb therapist_scheduling
createdb therapist_scheduling

# Re-run seed script
python3 api/seed.py
```

### CORS Issues

If you encounter CORS issues, ensure the FastAPI CORS middleware is properly configured in `api/main.py` and that the frontend URL matches the allowed origins.

## Development Tips

1. **API Testing**: Use the FastAPI docs at `http://localhost:8000/docs` to test API endpoints
2. **Database Inspection**: Use a tool like pgAdmin or connect via psql to inspect the database
3. **Logging**: Check both terminal windows for frontend and backend logs
4. **Hot Reload**: Both Next.js and FastAPI support hot reload during development

## Support

If you encounter any issues during setup, please check:

1. All prerequisites are installed correctly
2. PostgreSQL is running
3. Environment variables are set correctly
4. Both frontend and backend servers are running
5. Database connection string is valid

For additional help, refer to the official documentation:
- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
