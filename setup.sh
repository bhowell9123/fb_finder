#!/bin/bash

# People Search Tool - Development Setup Script

echo "🚀 Setting up People Search Tool for development..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.11+ first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Setup Frontend
echo "📦 Setting up frontend dependencies..."
cd frontend
if command -v pnpm &> /dev/null; then
    pnpm install
else
    npm install
fi
cd ..

# Setup Backend
echo "🐍 Setting up backend dependencies..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment and install dependencies
echo "Installing Python dependencies..."
source venv/bin/activate
pip install -r requirements.txt
cd ..

echo "✅ Setup complete!"
echo ""
echo "🎯 To start development:"
echo "1. Backend: cd backend && source venv/bin/activate && python src/main.py"
echo "2. Frontend: cd frontend && pnpm run dev (or npm run dev)"
echo ""
echo "🌐 URLs:"
echo "- Frontend: http://localhost:5173"
echo "- Backend API: http://localhost:5000"
echo ""
echo "📚 See README.md for detailed instructions"

