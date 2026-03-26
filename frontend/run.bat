@echo off
REM Hospital Infection Surveillance System - Frontend Startup Script (Windows)

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║  Starting Hospital Infection Surveillance System (HISS)      ║
echo ║  Frontend Services                                           ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
)

echo.
echo 🚀 Starting Vite development server on http://localhost:3000
echo.

call npm run dev

pause
