# Doppler Backend

Node.js + Express + PostgreSQL backend for Doppler deployment platform.

## Setup

1. Install PostgreSQL
2. Create database:
```sql
CREATE DATABASE doppler;
```

3. Install dependencies:
```bash
npm install
```

4. Configure environment:
```bash
cp .env.example .env
```

Edit `.env`:
```
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/doppler
JWT_SECRET=your-secret-key
```

5. Start server:
```bash
npm start
```

## API Endpoints

### Auth
- POST `/api/auth/register` - Register user
- POST `/api/auth/login` - Login user

### Projects (Protected)
- POST `/api/projects` - Create project
- GET `/api/projects` - Get all projects
- GET `/api/projects/:id` - Get project by ID
- GET `/api/projects/:id/deployments` - Get deployments
- GET `/api/projects/:id/logs` - Get logs
