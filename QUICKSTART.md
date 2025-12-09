# Quick Start Guide

## 1. Install PostgreSQL
Download from: https://www.postgresql.org/download/windows/

During installation, remember your password for user `postgres`.

## 2. Create Database
Open pgAdmin or psql and run:
```sql
CREATE DATABASE doppler;
```

## 3. Update Backend Config
Edit `backend/.env` and change the password:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/doppler
```

## 4. Install Dependencies

Backend:
```bash
cd backend
npm install
```

Frontend:
```bash
cd frontend
npm install
```

## 5. Start Application

Option A - Manual (2 terminals):
```bash
# Terminal 1
cd backend
npm start

# Terminal 2
cd frontend
npm start
```

Option B - Windows (double-click):
```
start.bat
```

## 6. Register User

1. Open: http://localhost:3000
2. Click "Get Started"
3. Register with:
   - Name: Test User
   - Email: test@test.com
   - Password: test123
4. You'll be logged in automatically!

## API Endpoints

- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/projects` - Get user projects (requires auth)
- POST `/api/projects` - Create project (requires auth)
