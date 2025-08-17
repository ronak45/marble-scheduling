#!/bin/bash

echo "🚀 Starting Therapist Scheduling App"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run setup.sh first."
    exit 1
fi

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Check if FastAPI is already running
if check_port 8000; then
    echo "⚠️  Port 8000 is already in use. FastAPI might already be running."
else
    echo "🐍 Starting FastAPI backend..."
    source venv/bin/activate
    export DATABASE_URL="postgresql://$(whoami):@localhost:5432/therapist_scheduling"
    cd api
    python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000 &
    FASTAPI_PID=$!
    cd ..
    echo "FastAPI started with PID: $FASTAPI_PID"
fi

# Wait a moment for FastAPI to start
sleep 3

# Check if Next.js is already running
if check_port 3000; then
    echo "⚠️  Port 3000 is already in use. Next.js might already be running."
else
    echo "⚛️  Starting Next.js frontend..."
    npm run dev &
    NEXTJS_PID=$!
    echo "Next.js started with PID: $NEXTJS_PID"
fi

echo ""
echo "✅ Application started!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    if [ ! -z "$FASTAPI_PID" ]; then
        kill $FASTAPI_PID 2>/dev/null
    fi
    if [ ! -z "$NEXTJS_PID" ]; then
        kill $NEXTJS_PID 2>/dev/null
    fi
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait
