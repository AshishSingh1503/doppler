@echo off
echo Enter your PostgreSQL password:
set /p PGPASS=

echo.
echo Creating database...
set PGPASSWORD=%PGPASS%
psql -U postgres -c "CREATE DATABASE doppler;"

echo.
echo Updating .env file...
echo PORT=3000 > backend\.env
echo DATABASE_URL=postgresql://postgres:%PGPASS%@localhost:5432/doppler >> backend\.env
echo JWT_SECRET=doppler-secret-key-change-in-production >> backend\.env
echo NODE_ENV=development >> backend\.env

echo.
echo Done! Database created and .env updated.
echo.
echo Run: cd backend ^&^& npm install ^&^& npm start
pause
