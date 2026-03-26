@echo off
REM Hospital Infection Surveillance System - Backend Startup Script (Windows)

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║  Starting Hospital Infection Surveillance System (HISS)      ║
echo ║  Backend Services                                            ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Check if venv exists, if not create it
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install requirements
echo 📥 Installing dependencies...
pip install -q -r requirements.txt

REM Run the FastAPI server
echo.
echo 🚀 Starting FastAPI server on http://localhost:8000
echo.

python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

pause
