@echo off
echo Starting Doppler with MongoDB...
echo.

echo Checking MongoDB...
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: MongoDB not found. Please install MongoDB first.
    echo Download from: https://www.mongodb.com/try/download/community
    pause
    exit /b 1
)

echo Starting MongoDB service...
net start MongoDB >nul 2>&1

echo Starting Backend...
start cmd /k "cd backend && npm start"

timeout /t 3 /nobreak >nul

echo Starting Frontend...
start cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo Doppler Started Successfully!
echo ========================================
echo Backend: http://localhost:3000
echo Frontend: http://localhost:3001
echo Database: MongoDB (Local)
echo.
echo Press any key to exit...
pause >nul