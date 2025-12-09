@echo off
echo ========================================
echo Doppler Database Setup
echo ========================================
echo.

set /p PGPASSWORD="Enter your PostgreSQL password: "
echo.

echo Creating database 'doppler'...
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -c "CREATE DATABASE doppler;" 2>nul
if %errorlevel% equ 0 (
    echo SUCCESS: Database 'doppler' created!
) else (
    "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -c "CREATE DATABASE doppler;" 2>nul
    if %errorlevel% equ 0 (
        echo SUCCESS: Database 'doppler' created!
    ) else (
        "C:\Program Files\PostgreSQL\14\bin\psql.exe" -U postgres -c "CREATE DATABASE doppler;" 2>nul
        if %errorlevel% equ 0 (
            echo SUCCESS: Database 'doppler' created!
        ) else (
            echo ERROR: Could not find PostgreSQL installation
            echo Please create database manually using pgAdmin
            pause
            exit /b 1
        )
    )
)

echo.
echo Updating backend/.env file...
(
echo PORT=3000
echo DATABASE_URL=postgresql://postgres:%PGPASSWORD%@localhost:5432/doppler
echo JWT_SECRET=doppler-secret-key-change-in-production
echo NODE_ENV=development
) > backend\.env

echo SUCCESS: .env file updated!
echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. cd backend
echo 2. npm install
echo 3. npm start
echo.
pause
