# Local Development Setup

## Prerequisites
- Node.js v16+
- PostgreSQL
- Git

## Setup Instructions

### 1. Database Setup
```sql
CREATE DATABASE doppler;
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Edit `backend/.env`:
```
PORT=3000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/doppler
JWT_SECRET=your-secret-key
NODE_ENV=development
```

Start backend:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

### 4. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:3000/api

## Features
- User registration/login
- GitHub OAuth integration
- Project management dashboard
- Repository selection and deployment
- Real-time logs and deployment history

## Development Workflow
1. Make changes to code
2. Test locally
3. Commit to Git
4. Deploy to your preferred hosting platform

## Deployment Options
- Frontend: Netlify, GitHub Pages, Firebase Hosting
- Backend: Railway, Render, Heroku
- Database: Railway PostgreSQL, Render PostgreSQL, Heroku Postgres