#!/bin/bash

# Hospital Infection Surveillance System - Backend Startup Script

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Starting Hospital Infection Surveillance System (HISS)      ║"
echo "║  Backend Services                                            ║"
echo "╚══════════════════════════════════════════════════════════════╝"

# Install dependencies if needed
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install requirements
echo "📥 Installing dependencies..."
pip install -q -r requirements.txt

# Run the FastAPI server
echo ""
echo "🚀 Starting FastAPI server on http://localhost:8000"
echo ""

python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
