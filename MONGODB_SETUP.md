# MongoDB Setup Guide

## Install MongoDB

### Windows:
1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Run installer with default settings
3. MongoDB will start automatically as a service

### Alternative - MongoDB Atlas (Cloud):
1. Go to https://www.mongodb.com/atlas
2. Create free account
3. Create cluster
4. Get connection string
5. Update `MONGODB_URI` in `.env`

## Start Application

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Start MongoDB (if local)
MongoDB should start automatically. If not:
```bash
# Windows
net start MongoDB

# Or start manually
mongod
```

### 3. Start Backend
```bash
cd backend
npm start
```

### 4. Start Frontend
```bash
cd frontend
npm start
```

## Test Connection

Backend will show:
```
MongoDB connected successfully
Server running on port 3000
```

Visit: http://localhost:3000/api/health
Should return: `{"status":"ok","database":"MongoDB"}`

## MongoDB Connection Strings

### Local:
```
MONGODB_URI=mongodb://localhost:27017/doppler
```

### Atlas (Cloud):
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/doppler
```

## Troubleshooting

### Connection Failed:
- Check MongoDB is running: `mongod --version`
- Verify connection string in `.env`
- For Atlas: Check IP whitelist and credentials

### Port Issues:
- Default MongoDB port: 27017
- Check if port is in use: `netstat -an | findstr 27017`