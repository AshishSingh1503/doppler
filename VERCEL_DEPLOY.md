# Deploy Doppler to Vercel

## Frontend Deployment

### Step 1: Prepare Frontend
The frontend is now configured for Vercel with:
- `vercel.json` - Routing configuration
- `vercel-build` script in package.json

### Step 2: Deploy to Vercel

**Option A - Vercel CLI:**
```bash
cd frontend
npm install -g vercel
vercel
```

**Option B - Vercel Dashboard:**
1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Set Root Directory: `frontend`
5. Framework Preset: Create React App
6. Click "Deploy"

### Step 3: Environment Variables

In Vercel Dashboard, add environment variable:
- Key: `REACT_APP_API_URL`
- Value: Your backend URL (e.g., `https://your-backend.herokuapp.com/api`)

### Step 4: Redeploy
After adding environment variables, click "Redeploy" in Vercel.

---

## Backend Deployment

Vercel doesn't support Node.js backends well. Use these alternatives:

### Option 1: Railway (Recommended)
```bash
cd backend
npm install -g @railway/cli
railway login
railway init
railway up
```

Add environment variables in Railway dashboard:
- `DATABASE_URL`
- `JWT_SECRET`
- `PORT`

### Option 2: Render
1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repo
4. Root Directory: `backend`
5. Build Command: `npm install`
6. Start Command: `npm start`
7. Add environment variables

### Option 3: Heroku
```bash
cd backend
heroku create doppler-backend
heroku addons:create heroku-postgresql:mini
heroku config:set JWT_SECRET=your-secret
git push heroku main
```

---

## Update Frontend API URL

After deploying backend, update frontend environment variable:

**In Vercel Dashboard:**
1. Go to your project
2. Settings → Environment Variables
3. Edit `REACT_APP_API_URL`
4. Set to your backend URL: `https://your-backend-url.com/api`
5. Redeploy

---

## Troubleshooting

### Frontend shows blank page
- Check browser console for errors
- Verify `REACT_APP_API_URL` is set correctly
- Check Vercel build logs

### API calls fail
- Ensure backend is deployed and running
- Check CORS is enabled in backend
- Verify `REACT_APP_API_URL` matches backend URL

### Routes don't work (404 on refresh)
- Ensure `vercel.json` is in frontend root
- Check routing configuration in vercel.json
