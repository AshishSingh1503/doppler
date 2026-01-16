# GitHub OAuth Integration Setup

## Step 1: Create GitHub OAuth App

1. Go to **GitHub Settings**: https://github.com/settings/developers
2. Click **"New OAuth App"**
3. Fill in details:
   - **Application name**: `Doppler`
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/auth/github/callback`
4. Click **"Register application"**
5. Copy **Client ID** and **Client Secret**

## Step 2: Add Environment Variables

### Backend (.env):
```
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### Frontend (.env):
```
REACT_APP_GITHUB_CLIENT_ID=your_github_client_id
```

## Step 3: Install Dependencies

```bash
cd backend
npm install axios
```

## Step 4: Test OAuth Flow

1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm start`
3. Click "Continue with GitHub" on login page
4. Authorize the app
5. Should redirect back and log you in

## Step 5: Production Setup

For production, update OAuth app settings:
- **Homepage URL**: `https://yourdomain.com`
- **Authorization callback URL**: `https://yourdomain.com/auth/github/callback`

Update environment variables with production URLs.

## Troubleshooting

### "Application not found" error:
- Check Client ID is correct
- Verify callback URL matches exactly

### "Bad verification code" error:
- Check Client Secret is correct
- Ensure backend is running on correct port

### CORS errors:
- Verify frontend and backend URLs match
- Check CORS configuration in backend