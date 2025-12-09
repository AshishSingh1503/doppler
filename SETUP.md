# Doppler Setup Guide

## Prerequisites
- Node.js v16+
- PostgreSQL installed and running

## Step 1: Setup PostgreSQL Database

Open PostgreSQL terminal (psql) and run:

```sql
CREATE DATABASE doppler;
```

Or use pgAdmin to create a database named `doppler`.

## Step 2: Setup Backend

```bash
cd backend
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

Edit `backend/.env`:
```
PORT=3000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/doppler
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

Replace `yourpassword` with your PostgreSQL password.

Start backend:
```bash
npm start
```

Backend will run on http://localhost:3000

## Step 3: Setup Frontend

Open new terminal:

```bash
cd frontend
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

The `.env` should contain:
```
REACT_APP_API_URL=http://localhost:3000/api
```

Start frontend:
```bash
npm start
```

Frontend will run on http://localhost:3000 (or 3001 if 3000 is taken)

## Step 4: Test Registration

1. Open browser: http://localhost:3000
2. Click "Get Started" or "Register"
3. Fill in:
   - Name: Your Name
   - Email: test@example.com
   - Password: password123
4. Click Register

You should be redirected to the dashboard!

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Check port 3000 is not in use

### Frontend can't connect
- Ensure backend is running on port 3000
- Check REACT_APP_API_URL in frontend/.env
- Check browser console for CORS errors

### Database connection error
- Verify PostgreSQL credentials
- Test connection: `psql -U postgres -d doppler`
