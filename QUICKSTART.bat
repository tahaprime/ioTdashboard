@echo off
REM Quick Start Script for IoT Room Access Control System (Windows)

setlocal enabledelayedexpansion

echo.
echo ==========================================
echo IoT Room Access Control - Quick Start
echo ==========================================
echo.

REM Step 1: Check prerequisites
echo [1] Checking prerequisites...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo WARNING: Node.js not found. Please install Node.js
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo WARNING: Python not found. Please install Python 3
    echo Download from: https://www.python.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i

echo [OK] Node.js %NODE_VERSION%
echo [OK] Python %PYTHON_VERSION%
echo.

REM Step 2: Install frontend dependencies
echo [2] Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)
echo [OK] Frontend dependencies installed
echo.

REM Step 3: Install backend dependencies
echo [3] Installing backend dependencies...
cd back
call pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..
echo [OK] Backend dependencies installed
echo.

REM Step 4: Summary
echo ==========================================
echo [OK] Installation Complete!
echo ==========================================
echo.
echo To run the application:
echo.
echo Step 1 - Start Backend:
echo   - Open Command Prompt
echo   - Run: cd back
echo   - Run: python app.py
echo.
echo Step 2 - Start Frontend:
echo   - Open another Command Prompt
echo   - Run: npm run dev
echo.
echo Then open: http://localhost:5173
echo.
echo For detailed setup, see FULLSTACK_SETUP.md
echo ==========================================
echo.
pause
