@echo off
echo Starting Doppler Backend and Frontend...
echo.

start cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul
start cmd /k "cd frontend && npm start"

echo.
echo Backend: http://localhost:3000
echo Frontend: http://localhost:3001
echo.
