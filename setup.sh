#!/bin/bash

echo "🚀 Setting up Therapist Scheduling App with Python + FastAPI backend"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11+ first."
    exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready &> /dev/null; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    echo "Run: brew services start postgresql@15"
    exit 1
fi

# Create virtual environment
echo "📦 Creating Python virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "📥 Installing Python dependencies..."
pip install -r requirements.txt

# Install Node.js dependencies
echo "📥 Installing Node.js dependencies..."
npm install

# Check if database exists
if ! psql -lqt | cut -d \| -f 1 | grep -qw therapist_scheduling; then
    echo "🗄️ Creating database..."
    createdb therapist_scheduling
fi

# Set environment variable and seed database
echo "🌱 Seeding database..."
export DATABASE_URL="postgresql://$(whoami):@localhost:5432/therapist_scheduling"
python api/seed.py

echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "1. Terminal 1 - Backend:  source venv/bin/activate && cd api && python -m uvicorn main:app --reload"
echo "2. Terminal 2 - Frontend: npm run dev"
echo ""
echo "Then visit: http://localhost:3000"
