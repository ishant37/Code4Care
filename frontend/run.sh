#!/bin/bash

# Hospital Infection Surveillance System - Frontend Startup Script

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Starting Hospital Infection Surveillance System (HISS)      ║"
echo "║  Frontend Services                                           ║"
echo "╚══════════════════════════════════════════════════════════════╝"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "🚀 Starting Vite development server on http://localhost:3000"
echo ""

npm run dev
